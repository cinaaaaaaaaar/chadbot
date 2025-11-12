const { SlashCommand, Client } = require("../..");
const { CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const μs = require("microseconds");
class PingCommand extends SlashCommand {
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
   * @param {Array} args
   * @param {CommandInteractionOptionResolver} options
   */
  async run(client, interaction) {
    const sent = await interaction.editReply(":ping_pong: Pinging...");
    const interactionPing = sent.createdTimestamp - interaction.createdTimestamp;
    const mongoStartTime = new Date().getTime();
    await client.database.schemas.guilds.findById(interaction.guild.id);
    const mongoServerPing = new Date().getTime() - mongoStartTime;
    const databaseStartTime = μs.now();
    await client.database.get("guilds", interaction.guild.id, "prefixes");
    const databasePing = μs.now() - databaseStartTime;
    await sent.edit(
      `**Latency:** \`${interactionPing}ms\`\n**Websocket Ping:** \`${
        client.ws.ping
      }ms\`\n**Database Ping**: \`0.${Math.round(
        databasePing
      )}ms\`\n**MongoDB Ping:** \`${mongoServerPing}ms\``
    );
  }
}

module.exports = PingCommand;
