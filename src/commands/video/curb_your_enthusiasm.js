const Client = require("../../lib/NLClient");
const { Command } = require("../..");
const { CommandInteraction } = require("discord.js");
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

module.exports = CurbYourEnthusiasmCommand;
