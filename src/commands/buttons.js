const Client = require("../structures/Client");
const { Command } = require("../..");
const {
  MessageButton,
  MessageActionRow,
  InteractionCollector,
} = require("discord.js");
const styles = {
  Blurple: "PRIMARY",
  Gray: "SECONDARY",
  Green: "SUCCESS",
  Red: "DANGER",
};

class ButtonCommand extends Command {
  constructor() {
    super({
      name: "buttons",
      description: "Sends a message with buttons.",
      options: [
        {
          name: "content",
          description: "The content of the message",
          type: 3,
          required: true,
        },
        {
          name: "label",
          description: "The name of the button",
          type: 3,
          required: true,
        },
        {
          name: "color",
          description: "The color of the button",
          type: 3,
          choices: [
            { name: "Blurple", value: "Blurple" },
            { name: "Gray", value: "Gray" },
            { name: "Green", value: "Green" },
            { name: "Red", value: "Red" },
          ],
          required: true,
        },
        {
          name: "code",
          description:
            "The code to run when the button is clicked (owner only)",
          type: 3,
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
    if (options[0].length > 2000)
      return interaction.reply({
        content: "Content can be maximum of 2,000 characters long.",
        ephemeral: true,
      });
    if (options[1].length > 80)
      return interaction.editReply({
        content: "Labels can be maximum of 80 characters long.",
        ephemeral: true,
      });

    const button = new MessageButton()
      .setLabel(options[1])
      .setStyle(styles[options[2]])
      .setCustomId("custom_button");
    const row = new MessageActionRow().addComponents(button);
    interaction.editReply({ content: options[0], components: [row] });

    const collector = new InteractionCollector(client, {
      componentType: "BUTTON",
    });
    collector.on("collect", (interaction) => {
      if ((interaction.customId = "custom_button")) {
        if (options[3] && client.config.owners.includes(interaction.user.id))
          eval(options[3]);
        else {
          interaction.reply({
            content: "You pressed a button!",
            ephemeral: true,
          });
        }
      }
    });
  }
}

module.exports = ButtonCommand;
