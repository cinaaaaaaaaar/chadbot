const Client = require("../../lib/NLClient");
const { Command } = require("../..");
const { CommandInteraction } = require("discord.js");
class AverageCommand extends Command {
  constructor() {
    super({
      name: "average",
      description: "Average Fan vs Average Enjoyer ",
      options: [
        {
          name: "text-1",
          description: "The text on the left (bozo fan)",
          type: "STRING",
          required: true,
        },
        {
          name: "text-2",
          description: "The text on the left (chad enjoyer)",
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
  async run(client, interaction, options) {}
}

module.exports = AverageCommand;
