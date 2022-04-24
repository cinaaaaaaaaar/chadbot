const { CommandInteraction } = require("discord.js");
const Client = require("../structures/Client");

/**
 *
 * @param {Client} client
 * @param {CommandInteraction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    await interaction.deferReply();
    const subcommand = interaction.options._subcommand;
    const command = subcommand
      ? client.commands.get(interaction.commandName).options.find((x) => x.name == subcommand)
      : client.commands.get(interaction.commandName);
    const options = interaction.options._hoistedOptions.map((data) => data.value);

    if (!command.permissions.every((v) => message.member.permissions.toArray().includes(v)))
      return interaction.editReply({
        embed: {
          title: "Missing Permissions",
          description: `**Required:** ${command.permissions
            .map((x) => `\`${x}\``)
            .join(", ")}`,
          color: "e84d3f",
        },
      });

    if (!interaction.channel.nsfw && command.nsfw)
      return interaction.editReply({
        embeds: [
          {
            title: "Inappropriate Channel",
            description: "```Please use this command in a NSFW channel.```",
            color: "e84d3f",
          },
        ],
      });

    command.run(client, interaction, options).catch((error) => {
      console.error(error);
      interaction.editReply("An error occured during execution");
    });
  }
};
