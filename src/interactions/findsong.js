const { SlashCommand, Embed, Client } = require("..");
const { CommandInteraction } = require("discord.js");
class FindsongCommand extends SlashCommand {
  constructor() {
    super({
      name: "find_song",
      description: "Damn that song's fire! I wonder what is the name of the song.",
      options: [
        {
          name: "url",
          description: "The URL of the song you are looking for",
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
    let url = options[0];
    if (!url.isURL() || (!url.includes(".mp3") && !url.includes(".mp4")))
      return interaction.error("Wrong file type, please provide a mp3 or mp4 file.");
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
