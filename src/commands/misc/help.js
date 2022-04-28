const Client = require("../../structures/Client");
const { Command, Embed } = require("../..");
const { Message } = require("discord.js");
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
    const embed = new Embed();
    const prefix = (await client.database.get("guilds", message.guild.id, "prefixes"))[0];
    const categories = client.categories.filter((x) => !x.module.hide);
    const category = categories
      .filter((x) => !x.module.hide)
      .find((x) => x.module.name == args[0] || x.module.aliases.includes(args[0]));
    const command = client.utils.findCommand(client, args[0], true);
    if (category?.module.nsfw && !message.channel.nsfw)
      return message.error("This category includes NSFW content.");
    if (command?.nsfw && !message.channel.nsfw)
      return message.error("This command includes NSFW content.");
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
      const required = args
        ? args.required
          ? args.required.map((arg) => `\`${arg.name}\``).join(" | ")
          : "None"
        : "None";
      const optional = args
        ? args.optional
          ? args.optional.map((arg) => `\`${arg}\``).join(" | ")
          : "None"
        : "None";
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
