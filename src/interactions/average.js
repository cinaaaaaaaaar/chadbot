const { SlashCommand, Client } = require("..");
const { CommandInteraction, MessageAttachment } = require("discord.js");
const { getVideoDurationInSeconds: getLength } = require("get-video-duration");
class AverageCommand extends SlashCommand {
  constructor() {
    super({
      name: "average",
      description: "Average Fan vs Average Enjoyer ",
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
   * @param {Array} options
   */
  async run(client, interaction, options) {
    if (options[0].length > 32 || options[1].length > 32)
      return interaction.error("Text is longer than 32 characters");
    const source = client.assets.json.urls.video.average;
    const length = await getLength(source);
    const data = {
      output: {
        format: "mp4",
        size: {
          width: 720,
          height: 720,
        },
      },
      timeline: {
        tracks: [
          {
            clips: [
              {
                asset: {
                  color: "#000000",
                  offset: { x: 0.25, y: 0.55 },
                  position: "topLeft",
                  size: "small",
                  text: options[0].wrap(16),
                  type: "title",
                  style: "subtitle",
                },
                start: 0,
                length,
              },
            ],
          },
          {
            clips: [
              {
                asset: {
                  color: "#000000",
                  offset: { x: -0.25, y: 0.55 },
                  position: "topRight",
                  size: "small",
                  text: options[1].wrap(16),
                  type: "title",
                  style: "subtitle",
                },

                start: 0,
                length,
              },
            ],
          },
          {
            clips: [
              {
                asset: {
                  src: source,
                  type: "video",
                  volume: 1,
                },
                start: 0,
                length,
              },
            ],
          },
        ],
      },
    };
    const render = await client.generator.render(data);
    const video = new MessageAttachment(render, "average.mp4");
    interaction.editReply({ files: [video] });
  }
}

module.exports = AverageCommand;
