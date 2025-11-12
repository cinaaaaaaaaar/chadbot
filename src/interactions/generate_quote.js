const { SlashCommand, Client } = require("..");
const { CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
class QuoteCommand extends SlashCommand {
  constructor() {
    super({
      name: "generate_quote",
      description:
        "Sends an AI generated quote with a random image in the background. Nonsense warning!",
      cooldown: 10,
      options: [
        {
          name: "audio",
          description: "Sends the quote as TTS and some background music",
          type: "BOOLEAN",
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
  async run(client, interaction, args) {
    client.generator.quote(interaction, args[0]);
  }
}

module.exports = QuoteCommand;
