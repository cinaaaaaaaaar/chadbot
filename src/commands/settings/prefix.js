const Client = require("../../structures/Client");
const { Command, Embed } = require("../..");
const { Message } = require("discord.js");
class PrefixCommand extends Command {
  constructor() {
    super({
      name: "prefix",
      description: "Add a prefix",
      args: {
        required: [
          {
            name: "action",
            message: "Please specify whether you will add or remove a prefix.",
          },
          {
            name: "prefix",
            message: "Please enter a prefix to add or remove.",
          },
        ],
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
    let prefixes = await client.database.get("guilds", message.guild.id, "prefixes");
    const prefix = args[1]?.replace(/"|`|'/g, "");
    if (args[0] === "add") {
      if (prefixes.length >= 5)
        return message.error("A server can't have more than 5 prefixes.");
      if (prefix.length > 5)
        return message.error("A prefix shouldn't be more than 5 characters long.");
      prefixes = await client.database.push("guilds", message.guild.id, "prefixes", prefix);
    } else if (args[0] === "remove") {
      if (prefixes.length <= 1) return message.error("A server must have at least 1 prefix.");
      if (!prefixes.find((x) => x == prefix)) return message.error("Unknown prefix.");
      prefixes = await client.database.remove("guilds", message.guild.id, "prefixes", prefix);
    }
    const embed = new Embed()
      .setTitle(`Prefixes of ${message.guild.name}`)
      .setDescription(prefixes.map((x, i) => `**${i + 1})** ${x}`).join("\n"));
    message.reply({ embeds: [embed] });
  }
}

module.exports = PrefixCommand;
