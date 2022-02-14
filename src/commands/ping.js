const Client = require("../lib/NLClient");
const { Command } = require("../..");
const { CommandInteraction } = require("discord.js");
class PingCommand extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Sends the latency of the bot.",
    });
  }
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {Array} options
   */
  async run(client, interaction, options) {
    const sent = await interaction.editReply(":ping_pong: Pinging...");
    const ping = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(
      `**Latency:** \`${ping}ms\` \n**Websocket Ping:** \`${client.ws.ping}ms\``
    );
  }
}

module.exports = PingCommand;
