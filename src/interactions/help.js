const { SlashCommand, Client, Embed } = require("..");
const {
  CommandInteraction,
  CommandInteractionOptionResolver,
  InteractionCollector,
} = require("discord.js-light");
class HelpCommand extends SlashCommand {
  constructor() {
    super({
      name: "help",
      description: "Sends the list of slash commands available.",
      options: [
        {
          name: "page",
          type: "INTEGER",
          description: "The page you want to view",
          required: false,
        },
      ],
    });
  }
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {Array} args
   * @param {CommandInteractionOptionResolver} options
   */
  async run(client, interaction, args) {
    const arg = args[0] - 1;
    const pages = [...client.commands].paginate(3);
    let page = arg >= 0 && arg < pages.length ? arg : 0;
    const embeds = [];
    pages.forEach((commands, i) => {
      const embed = new Embed()
        .setTitle(`Slash Commands`)
        .setFooter({ text: `Page ${i + 1}/${pages.length}` });
      commands.forEach((command) => {
        const [name, data] = command;
        const permissions =
          data.permissions.map((permission) => `\`${permission}\``).join(" | ") || "None";
        embed.addField(
          `/${name}`,
          `**Description:** ${data.description}\n**Cooldown:** ${data.cooldown} seconds\n**Permissions:** ${permissions}`
        );
      });
      embeds.push(embed);
    });
    const arrows = client.assets.json.emotes.buttons.arrows;
    const row = client.utils.addArrowButtons([arrows[0], arrows[3]], true);
    const sent = await interaction.editReply({ embeds: [embeds[page]], components: [row] });
    const collector = new InteractionCollector(client, {
      componentType: "BUTTON",
      message: sent,
      filter: (collected) => collected.user.id == interaction.user.id,
    });
    collector.on("collect", (collected) => {
      switch (collected.customId) {
        case "0":
          page--;
          page = page < 0 ? pages.length - 1 : page;
          break;
        case "1":
          page++;
          page = page > pages.length - 1 ? 0 : page;
          break;
        case "cancel":
          row.components.map((button) => {
            button.disabled = true;
            button.style = "SECONDARY";
          });
          break;
      }
      sent.edit({ embeds: [embeds[page]], components: [row] });
    });
  }
}

module.exports = HelpCommand;
