const Client = require("../../structures/Client");
const { Command } = require("../..");
const { CommandInteraction, MessageAttachment } = require("discord.js");
const { getVideoDurationInSeconds: getLength } = require("get-video-duration");

class CurbYourEnthusiasmCommand extends Command {
  constructor() {
    super({
      name: "curb_your_enthusiasm",
      description:
        "Adds the curb your enthusiasm ending to the end of the given image/video",
      options: [
        {
          name: "user",
          description: "The user you want to use their avatar as input",
          type: "USER",
          required: false,
        },
        {
          name: "url",
          description: "The URL to the asset you want to input",
          type: "STRING",
          required: false,
        },
        {
          name: "server_avatar",
          description: "If you want to input the avatar of the current server",
          type: "BOOLEAN",
          required: false,
        },
        {
          name: "asset_duration",
          description:
            "The duration in seconds you want the uploaded asset to be displayed.",
          type: "INTEGER",
          required: false,
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
    const url = client.utils.getImage(interaction, options);
    const fileType = url.split(/[#?]/)[0].split(".").pop().trim();
    const supportedFormats = {
      image: ["jpg", "jpeg", "png", "bmp"],
      video: ["mp4", "mov"],
    };
    if (
      !supportedFormats.image.concat(supportedFormats.video).includes(fileType)
    )
      return interaction.error("Unsupported file format");
    const type = supportedFormats.image.includes(fileType)
      ? "image"
      : supportedFormats.video.includes(fileType)
      ? "video"
      : "audio";
    let length;
    if (options.find((x) => typeof x === "number"))
      length = options.find((x) => typeof x === "number");
    else if (type === "video") length = await getLength(url);
    else length = 5;

    if (type === "video" && length > (await getLength(url)))
      return interaction.error("Duration is longer than source asset");

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
