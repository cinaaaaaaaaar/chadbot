const Client = require("../structures/Client");
const { SlashCommand } = require("..");
const { CommandInteraction, MessageCollector } = require("discord.js");
class FasttypeCommand extends SlashCommand {
  constructor() {
    super({
      name: "fast_type",
      description: "This how you practice for an argument",
    });
  }
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {Array} options
   */
  async run(client, interaction, options) {
    const words = [];
    for (let i = 0; i < 6; i++) {
      words.push(await client.utils.randomWord());
    }
    const normal = words.join(" ");
    const spaced = words.map((x) => `${x.split("").join(" ")}`).join("    ");
    interaction.editReply(`Type \`${spaced}\` in normal form in 30 seconds.`);
    const collector = new MessageCollector(interaction.channel, {
      filter: (message) => message.author.id == interaction.user.id,
      max: 1,
      time: 30000,
    });
    collector.on("collect", (collected) => {
      if (collected.content.toLowerCase() !== normal)
        return interaction.editReply("Nope, you couldn't make it.");
      else return interaction.editReply(`That's correct! Congrats!`);
    });
    collector.on("end", (collected, reason) => {
      if (reason === "time") interaction.editReply("Time's up!");
    });
  }
}

module.exports = FasttypeCommand;
