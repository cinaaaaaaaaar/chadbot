const { Command } = require("../..");
const Client = require("../../structures/Client");
const { Message } = require("discord.js");
const μs = require("microseconds");
class PingCommand extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Sends the latency of the bot.",
      cooldown: 5,
      aliases: ["latency"],
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
    const mongoStartTime = new Date().getTime();
    await client.database.schemas.guilds.findById(message.guild.id);
    const mongoServerPing = new Date().getTime() - mongoStartTime;
    const databaseStartTime = μs.now();
    await client.database.get("guilds", message.guild.id, "prefixes");
    const databasePing = μs.now() - databaseStartTime;
    await sent.edit(
      `**Latency:** \`${messagePing}ms\`\n**Websocket Ping:** \`${
        client.ws.ping
      }ms\`\n**Database Ping**: \`0.${Math.round(
        databasePing
      )}ms\`\n**MongoDB Ping:** \`${mongoServerPing}ms\``
    );
  }
}

module.exports = PingCommand;
