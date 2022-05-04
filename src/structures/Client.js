const { Client, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const Database = require("../database/Database");
const Generator = require("./Generator");
const Utils = require("./Utils");
const { readdirSync } = require("fs");
const types = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTACHMENT: 11,
};

class BaseClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.categories = new Collection();
    this.cooldowns = new Collection();
    this.config = require("../../config.json");
    this.package = require("../../package.json");
    this.database = new Database(process.env.MONGO_URI);
    this.generator = new Generator(this);
    this.utils = new Utils(this);
    this.assets = new Object();
    this.init(options.token);
  }
  async init(token) {
    this.loadAssets();
    this.loadEvents();
    await this.loadCommands();
    await this.login(token);
    await this.loadApplicationCommands();
    this.loadedAt = new Date().getTime();
  }
  async loadCommands() {
    const categories = readdirSync("./src/commands");
    await categories.forEach(async (category) => {
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
      });
    });
    console.log(
      `Loaded ${this.utils.getCommandSize()} commands in ${this.categories.size} categories.`
    );
  }
  async loadApplicationCommands() {
    const rest = new REST({ version: "9" }).setToken(this.token);
    const files = readdirSync("./src/interactions").filter((x) => x.endsWith(".js"));

    files.forEach((file) => {
      const Command = require(`../interactions/${file}`);
      const command = new Command();
      this.commands.set(command.name, command);
    });

    const commandData = this.commands.map(({ name, description, options }) => {
      const data = {
        name,
        description,
        options: options?.map((option) => {
          const type = types[option.type];
          delete option.type;
          option = { type, ...option };
          return option;
        }),
        defaultPermission: false,
      };
      return data;
    });
    const route =
      process.env.ENVIRONMENT === "DEV"
        ? Routes.applicationGuildCommands(this.user.id, this.config.developmentServerID)
        : Routes.applicationCommands(this.user.id);
    await rest.put(route, { body: commandData });
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
