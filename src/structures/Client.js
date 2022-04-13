const { Client, Collection } = require("discord.js");
const Database = require("../database/Database");
const Generator = require("./Generator");
const { readdirSync } = require("fs");

class BaseClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.config = require("../../config.json");
    this.package = require("../../package.json");
    this.database = new Database(process.env.MONGO_URI);
    this.generator = new Generator(this);
    this.utils = new Object();
    this.assets = new Object();
    this.init(options.token);
  }
  async init(token) {
    await this.login(token);
    this.loadUtils();
    this.loadAssets();
    this.loadCommands();
    this.loadEvents();
  }
  loadCommands() {
    const { SlashCommandBuilder } = require("@discordjs/builders");
    const items = readdirSync("./src/commands");
    items
      .filter((x) => x.endsWith(".js"))
      .forEach((commandFile) => {
        const Command = require(`../commands/${commandFile}`);
        const command = new Command();
        this.commands.set(command.data.name, command);
      });
    items
      .filter((x) => !x.endsWith(".js"))
      .forEach((folder) => {
        const folderProps = require(`../commands/${folder}/module.json`);
        const subCommands = readdirSync(`./src/commands/${folder}`);
        const command = new SlashCommandBuilder()
          .setName(folderProps.name)
          .setDescription(folderProps.description);
        subCommands
          .filter((x) => x.endsWith(".js"))
          .forEach((subcommandFile, index) => {
            const SubCommand = require(`../commands/${folder}/${subcommandFile}`);
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
                  [`add${option.type.upperFirstChar()}Option`](
                    (commandOption) =>
                      commandOption
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                        .setChoices(option.choices)
                  );
              else
                command.options
                  .find((x) => x.name == subcommand.data.name)
                  [`add${option.type.upperFirstChar()}Option`](
                    (commandOption) =>
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
                const SubCommand = require(`../commands/${data.name}/${option.name}`);
                const subcommand = new SubCommand();
                option.run = subcommand.run;
                option.params = subcommand.params;
              });
            this.commands.set(folder, commandObject);
          });
      });
    const existingCommands = this.application.commands.cache;
    this.commands.forEach((command) => {
      if (!existingCommands.find((x) => (x.data.name = command.data.name)))
        this.application.commands.create(command.data);
    });
    console.log(`Loaded ${this.commands.size} commands.`);
  }
  loadEvents() {
    const files = readdirSync("./src/events/");
    files.forEach((file) => {
      if (!file.endsWith(".js")) {
        const events = readdirSync(`./src/events/${file}`);
        events.forEach((event) => {
          this[file].on(event.split(".")[0], (...args) =>
            require(`../events/${file}/${event}`)(this, ...args)
          );
        });
      }

      this.on(file.split(".")[0], (...args) =>
        require(`../events/${file}`)(this, ...args)
      );
    });
  }
  loadUtils() {
    const utils = readdirSync("./src/utils");
    utils.forEach((util) => {
      this.utils[util.split(".")[0]] = require(`../utils/${util}`);
    });
  }
  loadAssets() {
    const folders = readdirSync("./assets");
    folders.forEach((folder) => {
      const assets = readdirSync(`./assets/${folder}`);
      assets.forEach((asset) => {
        this.assets[folder] = new Object();
        this.assets[folder][
          asset.split(".")[0]
        ] = require(`../../assets/${folder}/${asset}`);
      });
    });
  }
}

module.exports = BaseClient;
