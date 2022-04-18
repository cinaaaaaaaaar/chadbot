const { Client, Collection } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const Database = require("../database/Database");
const Generator = require("./Generator");
const { readdirSync } = require("fs");

class BaseClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.categories = new Collection();
    this.config = require("../../config.json");
    this.package = require("../../package.json");
    this.database = new Database(process.env.MONGO_URI);
    this.generator = new Generator(this);
    this.utils = new Object();
    this.assets = new Object();
    this.init(options.token);
  }
  async init(token) {
    this.loadCommands();
    this.loadUtils();
    this.loadAssets();
    this.loadEvents();
    await this.login(token);
    this.loadApplicationCommands();
  }
  loadCommands() {
    const categories = readdirSync("./src/commands");
    let commandCount = 0;
    categories.forEach(async (category) => {
      const module = require(`../commands/${category}/module.json`);
      this.categories.set(module.name, {
        module,
        commands: new Collection(),
      });
      const files = await readdirSync(`./src/commands/${category}`).filter((x) =>
        x.endsWith(".js")
      );
      files.forEach((file) => {
        const Command = require(`../commands/${category}/${file}`);
        const command = new Command();
        this.categories.get(module.name).commands.set(command.name, command);
        commandCount++;
      });
    });
    console.log(`Loaded ${this.categories.size} categories.`);
  }
  async loadApplicationCommands() {
    const rest = new REST({ version: "9" }).setToken(this.token);
    const files = readdirSync("./src/interactions").filter((x) => x.endsWith(".js"));

    files.forEach((file) => {
      const Command = require(`../interactions/${file}`);
      const command = new Command();
      this.commands.set(command.name, command);
    });

    const commands = await rest.get(Routes.applicationCommands(this.user.id));
    await commands.forEach(async (command) => {
      await rest.delete(Routes.applicationCommand(this.user.id, command.id));
    });
    const route =
      process.env.ENVIRONMENT === "PROD"
        ? Routes.applicationCommands(this.user.id)
        : Routes.applicationGuildCommands(this.user.id, this.config.developmentServerID);

    await rest.put(route, {
      body: this.commands.map((data) => {
        return {
          name: data.name,
          description: data.description,
          options: data.options,
          defaultPermission: false,
        };
      }),
    });
    console.log(`Loaded ${this.commands.size} application commands.`);
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

      this.on(file.split(".")[0], (...args) => require(`../events/${file}`)(this, ...args));
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
        this.assets[folder][asset.split(".")[0]] = require(`../../assets/${folder}/${asset}`);
      });
    });
  }
}

module.exports = BaseClient;
