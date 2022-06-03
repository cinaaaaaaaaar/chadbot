const { SlashCommand, Client } = require("..");
const {
  CommandInteraction,
  MessageAttachment,
  CommandInteractionOptionResolver,
} = require("discord.js-light");
const { getVideoDurationInSeconds: getLength } = require("get-video-duration");
const { rmSync } = require("fs");

class CurbYourEnthusiasmCommand extends SlashCommand {
  constructor() {
    super({
      name: "curb_your_enthusiasm",
      description: "Adds the curb your enthusiasm ending to the end of the given video",
      cooldown: 20,
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
    const url = options.resolved.attachments?.first().url || options.get("url")?.value;
    if (!url) return interaction.error("Enter a video attachment or URL.");
    const supportedFormats = ["mp4", "mov", "avi", "webm"];
    if (!(await client.utils.validateType(url, supportedFormats)))
      return interaction.error(
        `Unsupported file format.\nSupported file formats are: ${supportedFormats.join(", ")}`
      );
    let length = await getLength(url);
    let duration = options.get("second")?.value || length;
    if (duration > length) return interaction.error("Duration is longer than given video");

    const path = await client.generator.video.curb_your_enthusiasm(url, duration);
    const video = new MessageAttachment(path, "curb_your_enthusiasm.mp4");
    await interaction.editReply({ files: [video] });
    rmSync(path, {
      force: true,
    });
  }
}

module.exports = CurbYourEnthusiasmCommand;
