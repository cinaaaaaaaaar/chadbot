const Client = require("../structures/Client");
const { SlashCommand } = require("..");
const { CommandInteraction } = require("discord.js");
class QuoteCommand extends SlashCommand {
  constructor() {
    super({
      name: "generate_quote",
      description:
        "Sends an AI generated quote with a random image in the background. Nonsense warning!",
      options: [
        {
          name: "audio",
          description: "Sends the quote as TTS and some background music",
          type: 5,
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
    client.generator.quote(interaction, options[0]);
  }
}

module.exports = QuoteCommand;
