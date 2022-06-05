const { Command, Client, Embed } = require("../..");
const { Message, InteractionCollector } = require("discord.js-light");
class HelpSlashCommand extends Command {
  constructor() {
    super({
      name: "help_slash",
      description: "Get the list of slash commands you can use.",
      aliases: ["slash_help", "slash_commands"],
      args: {
        optional: ["page"],
      },
    });
  }
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {any[]} args
   */
  async run(client, message, args) {
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
    client.utils.paginate(message, message.author, embeds, page);
  }
}

module.exports = HelpSlashCommand;
