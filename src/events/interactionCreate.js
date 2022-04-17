const { Permissions } = require("discord.js");
module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    await interaction.deferReply();
    const subcommand = interaction.options._subcommand;
    const command = subcommand
      ? client.commands
          .get(interaction.commandName)
          .options.find((x) => x.name == subcommand)
      : client.commands.get(interaction.commandName);
    const options = interaction.options._hoistedOptions.map(
      (data) => data.value
    );

    if (
      command.permissions.length > 0 &&
      !interaction.member.permissions.has(
        Permissions.FLAGS[command.permissions]
      )
    )
      return interaction.editReply({
        embed: {
          title: "Missing Permissions",
          description: `**Required:** ${command.permissions
            .map((x) => `\`${x}\``)
            .join(", ")}`,
          color: "e84d3f",
        },
      });

    if (
      !interaction.channel.nsfw &&
      !interaction.channel.name.includes("nsfw") &&
      command.nsfw
    )
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
