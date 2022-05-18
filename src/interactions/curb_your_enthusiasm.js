const { SlashCommand, Client } = require("..");
const {
  CommandInteraction,
  MessageAttachment,
  CommandInteractionOptionResolver,
} = require("discord.js");
const { getVideoDurationInSeconds: getLength } = require("get-video-duration");

class CurbYourEnthusiasmCommand extends SlashCommand {
  constructor() {
    super({
      name: "curb_your_enthusiasm",
      description: "Adds the curb your enthusiasm ending to the end of the given video",

      options: [
        {
          name: "video",
          description: "The video you want to input",
          type: "ATTACHMENT",
          required: false,
        },
        {
          name: "url",
          description: "The url of the video you want to input",
          type: "STRING",
          required: false,
        },
        {
          name: "second",
          description: "The second you want to start the outro.",
          type: "NUMBER",
          required: false,
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
  async run(client, interaction, args, options) {
    const videoAsset = client.assets.json.urls.video.curb_your_enthusiasm;
    const audioAsset = client.assets.json.urls.audio.curb_your_enthusiasm;
    const url = options.resolved.attachments?.first().url || options.get("url").value;
    if (!url) return interaction.error("Enter a video attachment or URL.");
    const fileType = url.split(/[#?]/)[0].split(".").pop().trim();
    const supportedFormats = ["mp4", "mov"];
    if (!supportedFormats.includes(fileType))
      return interaction
        .error(
          `Unsupported file format.\nSupported file formats are: ${supportedFormats.map(
            (x) => `\`${x}\``
          )}`
        )
        .join(", ");
    let length = await getLength(url);
    let duration = options.get("second").value || length;
    if (duration > length) return interaction.error("Duration is longer than given video");

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
                  src: url,
                  volume: 1,
                  type: "video",
                },
                fit: "contain",
                start: 0,
                length: duration,
              },
              {
                asset: {
                  type: "video",
                  src: videoAsset,
                },
                length: await getLength(videoAsset),
                start: duration,
              },
              {
                asset: {
                  type: "audio",
                  src: audioAsset,
                },
                length: await getLength(audioAsset),
                start: duration - (duration * 2) / 10,
              },
            ],
          },
        ],
      },
    };

    const render = await client.generator.render(data);
    const video = new MessageAttachment(render, "curb_your_enthusiasm.mp4");
    interaction.editReply({ files: [video] });
  }
}

module.exports = CurbYourEnthusiasmCommand;
