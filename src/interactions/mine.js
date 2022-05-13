const { SlashCommand, Client } = require("..");
const {
  CommandInteraction,
  MessageButton,
  MessageActionRow,
  InteractionCollector,
} = require("discord.js");
const BaseGame = require("../structures/games/BaseGame");
const arrows = [
  "974057604999438466",
  "974057605523726336",
  "974057605506945074",
  "974057605234327573",
];
const TIMEOUT_DURATION = 30;
class MineCommand extends SlashCommand {
  constructor() {
    super({
      name: "mine",
      description: "Play Minecraft inside Discord! Collected items can be sold later.",
    });
  }
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {any[]} options
   */
  async run(client, interaction, options) {
    const emotes = client.assets.json.emotes.minecraft;
    const blocks = emotes.mine;
    const game = new BaseGame(
      { x: 100, y: 100 },
      { x: 5, y: 5 },
      {
        character: emotes.steve,
        blocks,
      },
      client
    );
    const buttons = [];
    arrows.forEach((arrow, i) => {
      const button = new MessageButton()
        .setEmoji(arrow)
        .setStyle("PRIMARY")
        .setCustomId(i.toString());
      buttons.push(button);
    });
    const cancel = new MessageButton()
      .setEmoji(client.assets.json.emotes.x)
      .setStyle("DANGER")
      .setCustomId("cancel");
    buttons.push(cancel);
    const row = new MessageActionRow().setComponents(buttons);
    const sent = await interaction.editReply({ content: game.render(), components: [row] });

    const collector = new InteractionCollector(client, {
      componentType: "BUTTON",
    });
    let lastCollected = new Date().getTime();

    collector.on("collect", async (collected) => {
      if (sent.id !== collected.message.id) return;
      if (collected.user.id != interaction.user.id)
        return collected.reply({
          content: "Only the author of the command can control the game",
          ephemeral: true,
        });
      lastCollected = new Date().getTime();
      switch (collected.customId) {
        case "0":
          moveAndCollect(-1, 0);
          break;
        case "1":
          moveAndCollect(0, -1);
          break;
        case "2":
          moveAndCollect(0, 1);
          break;
        case "3":
          moveAndCollect(1, 0);
          break;
        case "cancel":
          endGame(emotes.steve_canceled, "cancel");
          break;
      }
      if (collected.customId !== "cancel")
        sent.edit({ content: game.render(), components: [row] });
    });

    const interval = setInterval(() => {
      const now = new Date().getTime();
      if (game.canceled || collector.ended) clearInterval(interval);
      if (now - lastCollected > TIMEOUT_DURATION * 1000 && !game.canceled)
        endGame(emotes.steve_timeout, "timeout");
    }, 1000);

    collector.on("end", async (_, reason) => {
      if (reason === "timeout")
        interaction.channel.send(
          `The game was canceled due to ${TIMEOUT_DURATION} seconds of inactivity`
        );
      if (reason === "cancel") interaction.channel.send("Canceled the game");
    });

    async function moveAndCollect(x, y) {
      game.moveChar(x, y);
      for (let i = 0; i < blocks.length; i++) {
        if (game.view[game.charLocation.y][game.charLocation.x] == i && blocks[i].id) {
          game.map[game.charLocation.y + game.viewLocation.y][
            game.charLocation.x + game.viewLocation.x
          ] = 0;
          game.view[game.charLocation.y][game.charLocation.x] = 0;
          await client.database.addToInv(interaction.user.id, {
            id: blocks[i].id,
            amount: 1,
          });
        }
      }
    }
    async function endGame(emoji, reason) {
      collector.stop(reason);
      game.canceled = true;
      buttons.map((button) => {
        button.disabled = true;
        button.style = "SECONDARY";
      });
      row.setComponents([buttons]);
      sent.edit({
        content: game.render().replace(game.emojis.character, emoji),
        components: [row],
      });
    }
  }
}

module.exports = MineCommand;
