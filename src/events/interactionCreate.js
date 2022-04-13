module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    await interaction.deferReply();
    const command = client.commands.get(interaction.commandName);
    const subcommand = interaction.options._subcommand;
    const options = interaction.options._hoistedOptions.map(
      (data) => data.value
    );
    if (subcommand)
      command.data.options
        .find((x) => x.name == subcommand)
        .run(client, interaction, options)
        .catch((error) => {
          console.error(error);
          interaction.editReply("An error occured during execution");
        });
    else
      command.run(client, interaction, options).catch((error) => {
        console.error(error);
        interaction.editReply("An error occured during execution");
      });
  }
};
