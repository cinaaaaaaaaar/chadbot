const { Command } = require("../..");

const { Message } = require("discord.js-light");
const μs = require("microseconds");
class PingCommand extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Sends the latency of the bot.",
      cooldown: 5,
      aliases: ["latency"],
      args: {
        optional: ["extended"],
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
    const sent = await message.reply(":ping_pong: Pinging...");
    const messagePing = sent.createdTimestamp - message.createdTimestamp;
    const extended = ["yes", "true", "extend"].includes(args[0]);
    let string;
    if (extended) {
      const mongoStartTime = new Date().getTime();
      await client.database.schemas.guilds.findById(message.guild.id);
      const mongoServerPing = new Date().getTime() - mongoStartTime;
      const databaseStartTime = μs.now();
      await client.database.get("guilds", message.guild.id, "prefixes");
      const databasePing = μs.now() - databaseStartTime;
      string = `**Latency:** \`${messagePing}ms\`\n**Websocket Ping:** \`${
        client.ws.ping
      }ms\`\n**Database Ping**: \`0.${Math.round(
        databasePing
      )}ms\`\n**MongoDB Ping:** \`${mongoServerPing}ms\``;
    } else
      string = `**Latency:** \`${messagePing}ms\`\n**Websocket Ping:** \`${client.ws.ping}ms\``;

    await sent.edit(string);
  }
}

module.exports = PingCommand;
