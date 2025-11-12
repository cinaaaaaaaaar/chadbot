const { SlashCommand, Client } = require("..");
const {
  MessageButton,
  MessageActionRow,
  InteractionCollector,
  CommandInteractionOptionResolver,
} = require("discord.js");
const styles = {
  Blurple: "PRIMARY",
  Gray: "SECONDARY",
  Green: "SUCCESS",
  Red: "DANGER",
};

class ButtonCommand extends SlashCommand {
  constructor() {
    super({
      name: "buttons",
      description: "Sends a message with buttons.",
      options: [
        {
          name: "content",
          description: "The content of the message",
          type: "STRING",
          required: true,
        },
        {
          name: "label",
          description: "The name of the button",
          type: "STRING",
          required: true,
        },
        {
          name: "color",
          description: "The color of the button",
          type: "STRING",
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
          description: "The code to run when the button is clicked (owner only)",
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
  async run(client, interaction, args) {
    if (args[0].length > 2000)
      return interaction.editReply({
        content: "Content can be maximum of 2,000 characters long.",
        ephemeral: true,
      });
    if (args[1].length > 80)
      return interaction.editReply({
        content: "Labels can be maximum of 80 characters long.",
        ephemeral: true,
      });

    const button = new MessageButton()
      .setLabel(args[1])
      .setStyle(styles[args[2]])
      .setCustomId("custom_button");
    const row = new MessageActionRow().addComponents(button);
    interaction.editReply({ content: args[0], components: [row] });

    const collector = new InteractionCollector(client, {
      componentType: "BUTTON",
    });
    collector.on("collect", (buttonInteraction) => {
      if (buttonInteraction.customId === "custom_button") {
        if (args[3] && client.config.owners.includes(buttonInteraction.user.id)) eval(args[3]);
        else {
          buttonInteraction.reply({
            content: "You pressed a button!",
            ephemeral: true,
          });
        }
      }
    });
  }
}

module.exports = ButtonCommand;
