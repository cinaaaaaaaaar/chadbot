const { SlashCommand, Client } = require("..");
const {
  CommandInteraction,
  MessageAttachment,
  CommandInteractionOptionResolver,
} = require("discord.js-light");
const { getVideoDurationInSeconds: getLength } = require("get-video-duration");
class AverageCommand extends SlashCommand {
  constructor() {
    super({
      name: "average",
      description: "Average Fan vs Average Enjoyer ",
      cooldown: 20,
      options: [
        {
          name: "text-1",
          description: "The text on the left (bozo fan)",
          type: "STRING",
          required: true,
        },
        {
          name: "text-2",
          description: "The text on the left (chad enjoyer)",
          type: "STRING",
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
    if (args[0].length > 32 || args[1].length > 32)
      return interaction.error("Text is longer than 32 characters");

    const render = await client.generator.video.average(args);
    const video = new MessageAttachment(render, "average.mp4");
    interaction.editReply({ files: [video] });
  }
}

module.exports = AverageCommand;
