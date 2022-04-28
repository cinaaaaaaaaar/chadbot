const { SlashCommand, Client } = require("..");
const { CommandInteraction, MessageAttachment } = require("discord.js");
const { getVideoDurationInSeconds: getLength } = require("get-video-duration");

class CurbYourEnthusiasmCommand extends SlashCommand {
  constructor() {
    super({
      name: "curb_your_enthusiasm",
      description: "Adds the curb your enthusiasm ending to the end of the given image/video",

      options: [
        {
          name: "url",
          description: "The URL to the asset you want to input",
          type: "STRING",
          required: true,
        },
        {
          name: "second",
          description: "The second you want to start the outro.",
          type: "NUMBER",
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
    const videoAsset = client.assets.json.urls.video.curb_your_enthusiasm;
    const audioAsset = client.assets.json.urls.audio.curb_your_enthusiasm;
    const url = options[0];
    const fileType = url.split(/[#?]/)[0].split(".").pop().trim();
    const supportedFormats = {
      image: ["jpg", "jpeg", "png", "bmp"],
      video: ["mp4", "mov"],
    };
    if (!supportedFormats.image.concat(supportedFormats.video).includes(fileType))
      return interaction.error("Unsupported file format");
    const type = supportedFormats.image.includes(fileType)
      ? "image"
      : supportedFormats.video.includes(fileType)
      ? "video"
      : "audio";
    let length = options[1];
    if (!length) length = await getLength(url);

    if (length > (await getLength(url)))
      return interaction.error("Duration is longer than given video");

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
                  type,
                },
                fit: "contain",
                start: 0,
                length,
              },
              {
                asset: {
                  type: "video",
                  src: videoAsset,
                },
                length: await getLength(videoAsset),
                start: length,
              },
              {
                asset: {
                  type: "audio",
                  src: audioAsset,
                },
                length: await getLength(audioAsset),
                start: length - (length * 2) / 10,
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
