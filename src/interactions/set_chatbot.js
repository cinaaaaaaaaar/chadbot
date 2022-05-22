const { SlashCommand, Client } = require("..");
const { CommandInteraction, CommandInteractionOptionResolver } = require("discord.js-light");
class ChatbotChannelCommand extends SlashCommand {
  constructor() {
    super({
      name: "set_chatbot",
      description: "Set the channel that the bot will listen for messages and reply",
      permissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "channel",
          description: "The channel that the bot will watch for messages",
          type: "CHANNEL",
          required: true,
        },
        {
          name: "character",
          description: "The personality of the bot.",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "Friendly",
              value: "friendly",
            },
            {
              name: "Sarcastic",
              value: "sarcastic",
            },
          ],
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
   * @param {Array} args
   * @param {CommandInteractionOptionResolver} options
   */
  async run(client, interaction, args) {
    const channel = interaction.guild.channels.cache.get(args[0]);
    const channels = await client.database.get("guilds", interaction.guild.id, "aiChannels");
    let existingConfig = channels.find((x) => x.id == channel.id);
    if (channel.type !== "GUILD_TEXT")
      return interaction.editReply(`Please input a text channel`);
    if (args[2]) {
      if (existingConfig) {
        await client.database.remove(
          "guilds",
          interaction.guild.id,
          "aiChannels",
          existingConfig
        );
        existingConfig.character = args[1];
        client.database.push("guilds", interaction.guild.id, "aiChannels", existingConfig);
        interaction.editReply(
          `I've updated the personality of ${channel} to ${args[1].toLowerCase()}`
        );
      } else {
        client.database.push("guilds", interaction.guild.id, "aiChannels", {
          id: channel.id,
          character: args[1],
        });
        interaction.editReply(`I've added ${channel} to the chatbot list.`);
      }
    } else {
      client.database.remove("guilds", interaction.guild.id, "aiChannels", existingConfig);
      interaction.editReply(`I've removed ${channel} from the chatbot list.`);
    }
  }
}

module.exports = ChatbotChannelCommand;
