const Client = require("../lib/NLClient");
const { Command, NLEmbed } = require("..");
const { CommandInteraction } = require("discord.js");
class FindsongCommand extends Command {
  constructor() {
    super({
      name: "find_song",
      description:
        "Damn that song's fire! I wonder what is the name of the song.",
      options: [
        {
          name: "url",
          description: "The URL of the song you are looking for",
          type: 3,
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
    // let url;
    // if (options[0]) url = options[0].url;
    // else if (!options[0]) {
    //   return interaction.error("Please enter a video or audio file/URL");
    // } else url = options[1];
    if (!url.isURL() && !url.includes(".mp3") && !url.includes(".mp4"))
      return interaction.error(
        "Wrong file type, please provide a mp3 or mp4 file."
      );
    const auddURL = `https://api.audd.io/?api_token=${process.env.AUDD_TOKEN}&url=${url}`;
    const res = await request.get(auddURL);
    if (!res.body.result || res.body.status !== "success")
      return interaction.error("Unknown song.");
    const embed = new NLEmbed()
      .setTitle(res.body.result.title)
      .setDescription(`by ${res.body.result.artist}`)
      .addField("Album", res.body.result.album, true)
      .addField("Category", res.body.result.label, true)
      .addField("Found at", res.body.result.timecode, true)
      .setURL(res.body.result.song_link)
      .setImage(`${res.body.result.song_link}?thumb`)
      .setColor("RANDOM")
      .setFooter({
        text: "Powered by audd.io",
        iconURL: "https://dashboard.audd.io/img/transperent.png",
      });
    interaction.editReply({ embeds: [embed] });
  }
}

module.exports = FindsongCommand;
