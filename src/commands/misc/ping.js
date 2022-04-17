const { Command } = require("../..");
const Client = require("../../structures/Client");
const { Message } = require("discord.js");
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
    const ping = sent.createdTimestamp - message.createdTimestamp;
    await sent.edit(
      `**Latency:** \`${ping}ms\` \n**Websocket Ping:** \`${client.ws.ping}ms\``
    );
  }
}

module.exports = PingCommand;
