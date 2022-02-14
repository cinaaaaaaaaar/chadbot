const Client = require("../NLClient");
const { readdirSync } = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);
const { SlashCommandBuilder } = require("@discordjs/builders");
/**
 *
 * @param {Client} client
 */
module.exports = async (client) => {
  const items = await readdirSync("./src/commands");
  await items
    .filter((x) => x.endsWith(".js"))
    .forEach((commandFile) => {
      const Command = require(`../../commands/${commandFile}`);
      const command = new Command();
      client.commands.set(command.data.name, command);
    });
  await items
    .filter((x) => !x.endsWith(".js"))
    .forEach(async (folder) => {
      const folderProps = require(`../../commands/${folder}/module.json`);
      const subCommands = await readdirSync(`./src/commands/${folder}`);
      const command = new SlashCommandBuilder()
        .setName(folderProps.name)
        .setDescription(folderProps.description);
      await subCommands
        .filter((x) => x.endsWith(".js"))
        .forEach((subcommandFile, index) => {
          const SubCommand = require(`../../commands/${folder}/${subcommandFile}`);
          const subcommand = new SubCommand();

          command.addSubcommand((command) =>
            command
              .setName(subcommand.data.name)
              .setDescription(subcommand.data.description)
          );
          subcommand.data.options.forEach((option) => {
            if (option.choices)
              command.options
                .find((x) => x.name == subcommand.data.name)
                [`add${option.type.upperFirstChar()}Option`]((commandOption) =>
                  commandOption
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
                    .setChoices(option.choices)
                );
            else
              command.options
                .find((x) => x.name == subcommand.data.name)
                [`add${option.type.upperFirstChar()}Option`]((commandOption) =>
                  commandOption
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
                );
          });
          const data = command.toJSON();
          const commandObject = { data };
          if (index == subCommands.length - 2)
            data.options.forEach((option) => {
              const SubCommand = require(`../../commands/${data.name}/${option.name}`);
              const subcommand = new SubCommand();
              option.run = subcommand.run;
            });
          client.commands.set(folder, commandObject);
        });
    });

  rest.get(Routes.applicationCommands(client.config.id)).then((data) => {
    const promises = [];
    for (const command of data) {
      const deleteUrl = `${Routes.applicationCommands(client.config.id)}/${
        command.id
      }`;
      promises.push(rest.delete(deleteUrl));
    }
    return Promise.all(promises);
  });
  rest
    .put(
      Routes.applicationGuildCommands(
        client.config.id,
        client.config.developmentServerID
      ),
      { body: client.commands.map((command) => command.data) }
    )
    .then(() => console.log(`Loaded ${client.commands.size} slash commands.`))
    .catch(console.error);
};
