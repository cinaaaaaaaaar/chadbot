const { SlashCommand, Client } = require("..");
const {
  CommandInteraction,
  InteractionCollector,
  CommandInteractionOptionResolver,
} = require("discord.js-light");
const BaseGame = require("../structures/games/BaseGame");

const TIMEOUT_DURATION = 30;
class MineCommand extends SlashCommand {
  constructor() {
    super({
      name: "mine",
      description: "Play Minecraft inside Discord! Collected items can be sold later.",
      cooldown: 15,
    });
  }
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {Array} args
   * @param {CommandInteractionOptionResolver} options
   */
  async run(client, interaction) {
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
    const row = client.utils.addArrowButtons(client.assets.json.emotes.buttons.arrows, true);
    const sent = await interaction.editReply({ content: game.render(), components: [row] });

    const collector = new InteractionCollector(client, {
      componentType: "BUTTON",
      message: sent,
      filter: (collected) => collected.user.id == interaction.user.id,
    });
    let lastCollected = new Date().getTime();
    collector.on("collect", async (collected) => {
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
        interaction.user.send(
          `The game was canceled due to ${TIMEOUT_DURATION} seconds of inactivity. [UTC ${new Date().toLocaleTimeString()}]`
        );
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
      row.components.map((button) => {
        button.disabled = true;
        button.style = "SECONDARY";
      });
      row.setComponents([row.components]);
      sent.edit({
        content: game.render().replace(game.emojis.character, emoji),
        components: [row],
      });
    }
  }
}

module.exports = MineCommand;
