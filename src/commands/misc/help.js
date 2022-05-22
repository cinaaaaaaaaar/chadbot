const { Command, Embed, Client } = require("../..");
const { Message } = require("discord.js-light");
class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Sends the list of commands",
      aliases: ["commands"],
      args: {
        optional: ["category", "command"],
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
    const prefix = (await client.database.get("guilds", message.guild.id, "prefixes"))[0];
    const embed = new Embed().setDescription(
      `Type \`${prefix}help_slash\` to view slash commands`
    );
    const categories = client.categories.filter((x) => !x.module.hide);
    const category = categories
      .filter((x) => !x.module.hide)
      .find((x) => x.module.name == args[0] || x.module.aliases.includes(args[0]));
    const command = client.utils.findCommand(args[0], true);
    if (category?.module.nsfw && !message.channel.nsfw)
      return message.error("This category contains NSFW content.");
    if (command?.nsfw && !message.channel.nsfw)
      return message.error("This command contains NSFW content.");
    if (category)
      embed
        .setTitle(`${category.module.name.upperFirstChar()} (${category.commands.size})`)
        .setDescription(category.module.description)
        .addField("Commands", category.commands.map((cmd) => `\`${cmd.name}\``).join(" | "));
    else if (command) {
      const { aliases, args, permissions } = command;
      const formattedAliases =
        aliases.length > 0
          ? aliases.map((alias) => `\`${alias}\``).join(" | ")
          : "No aliases.";
      const required = args?.required?.map((arg) => `\`${arg.name}\``).join(" | ") || "None";
      const optional = args?.optional?.map((arg) => `\`${arg}\``).join(" | ") || "None";

      const formattedArgs = `Required: ${required}\nOptional: ${optional}`;
      const formattedPermissions =
        permissions.map((permission) => `\`${permission}\``).join(" | ") || "`NONE`";
      embed
        .setTitle(command.name.upperFirstChar())
        .setDescription(command.description)
        .addField("Aliases", formattedAliases)
        .addField("Arguments", formattedArgs)
        .addField("Permissions", formattedPermissions);
    } else {
      embed.setTitle("Help Menu");
      categories.forEach((category) => {
        embed.addField(
          `${category.module.name.upperFirstChar()} (${category.commands.size})`,
          `${
            category.module.nsfw && !message.channel.nsfw
              ? "NSFW only"
              : `${prefix}help ${category.module.name}`
          }`
        );
      });
    }

    message.reply({ embeds: [embed] });
  }
}

module.exports = HelpCommand;
