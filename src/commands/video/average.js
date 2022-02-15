const Client = require("../../lib/NLClient");
const { Command } = require("../..");
const { CommandInteraction, MessageAttachment } = require("discord.js");
const { getVideoDurationInSeconds: getLength } = require("get-video-duration");
class AverageCommand extends Command {
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
    const source = client.json.urls.video.average;
    const length = await getLength(source);
    const edit = {
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
    const api = client.generator.video.api;
    const render = await api.postRender(edit);
    let status = await api.getRender(render.response.id);
    while (status.response.status !== "done") {
      await wait(5000);
      status = await api.getRender(render.response.id);
    }
    const video = new MessageAttachment(
      (await api.getRender(render.response.id)).response.url,
      "average.mp4"
    );
    interaction.editReply({ files: [video] });
  }
}

module.exports = AverageCommand;
