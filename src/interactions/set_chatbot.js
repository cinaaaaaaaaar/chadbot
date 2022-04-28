const { SlashCommand, Client } = require("..");
const { CommandInteraction } = require("discord.js");
class ChatbotChannelCommand extends SlashCommand {
  constructor() {
    super({
      name: "set_chatbot",
      description: "Set the channel that the bot will listen for messages and reply",
      permissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "channel",
          description: "The channel that the bot will listen for messages",
          type: "CHANNEL",
          required: true,
        },
        {
          name: "status",
          description: "Choose whether you enable or disable the feature",
          type: "BOOLEAN",
          required: true,
        },
      ],
    });
  }
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {Array} options
   */
  async run(client, interaction, options) {
    const channel = interaction.guild.channels.cache.get(options[0]);
    if (channel.type !== "GUILD_TEXT")
      return interaction.editReply(`Please input a text channel`);
    if (options[1]) {
      client.database.push("guilds", interaction.guild.id, "aiChannels", channel.id);
      interaction.editReply(`I've added ${channel} to the chatbot list.`);
    } else {
      client.database.remove("guilds", interaction.guild.id, "aiChannels", channel.id);
      interaction.editReply(`I've removed ${channel} from the chatbot list.`);
    }
  }
}

module.exports = ChatbotChannelCommand;
