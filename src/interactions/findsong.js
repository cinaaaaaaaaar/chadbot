const { SlashCommand, Embed, Client } = require("..");
const { CommandInteraction, CommandInteractionOptionResolver } = require("discord.js-light");
class FindsongCommand extends SlashCommand {
  constructor() {
    super({
      name: "find_song",
      description: "Damn that song's fire! I wonder the name of the song.",
      cooldown: 15,
      options: [
        {
          name: "file",
          description: "The attachment that contains the song you are looking for",
          type: "ATTACHMENT",
          required: false,
        },
        {
          name: "url",
          description: "The URL that contains the song you are looking for",
          type: "STRING",
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
    if (!url) return interaction.error("Please enter a audio/video attachment or URL");
    const fileType = url.split(/[#?]/)[0].split(".").pop().trim().toLowerCase();
    const supportedFormats = {
      audio: ["mp3", "wav", "m4a"],
      video: ["mp4", "mov"],
    };
    const joined = supportedFormats.audio
      .concat(supportedFormats.video)
      .map((x) => `\`${x}\``)
      .join(", ");
    if (!supportedFormats.audio.concat(supportedFormats.video).includes(fileType))
      return interaction.error(
        `Unsupported file format.\nSupported file formats are: ${joined}`
      );
    const auddURL = `https://api.audd.io/?api_token=${process.env.AUDD_TOKEN}&url=${url}`;
    const response = await fetch(auddURL);
    const body = await response.json();
    if (!body.result || body.status !== "success") return interaction.error("Unknown song.");
    const embed = new Embed()
      .setTitle(body.result.title)
      .setDescription(`by ${body.result.artist}`)
      .addField("Album", body.result.album, true)
      .addField("Category", body.result.label, true)
      .addField("Found at", body.result.timecode, true)
      .setURL(body.result.song_link)
      .setImage(`${body.result.song_link}?thumb`)
      .setColor("RANDOM")
      .setFooter({
        text: "Powered by audd.io",
        iconURL: "https://dashboard.audd.io/img/transperent.png",
      });
    interaction.editReply({ embeds: [embed] });
  }
}

module.exports = FindsongCommand;
