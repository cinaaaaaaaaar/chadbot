const { Client, Collection } = require("discord.js"),
  Database = require("../database/class/Database"),
  Generator = require("./structures/Generator"),
  Utils = require("./structures/Utils"),
  { readdirSync } = require("fs"),
  jsons = {};

class NoLimits extends Client {
  constructor(options) {
    super(options);

    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.categories = new Collection();
    this.aliases = new Collection();
    this.config = require("../../config.json");
    this.package = require("../../package.json");

    const jsonFiles = readdirSync("./assets/json");

    jsonFiles.forEach((file) => {
      Object.assign(jsons, {
        [file.split(".")[0]]: require(`../../assets/json/${file}`),
      });
    });

    this.json = jsons;
    this.database = new Database(process.env.MONGO_URI);
    this.utils = new Utils(this);
    this.generator = new Generator(this);
  }
}

module.exports = NoLimits;
