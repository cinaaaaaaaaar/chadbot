const mongoose = require("mongoose");
const Cache = require("./Cache");
const { Collection } = require("discord.js");
const { uniq } = require("lodash");
const { EventEmitter } = require("events");
class Database extends EventEmitter {
  constructor(uri) {
    super();
    mongoose
      .connect(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
      })
      .then((data) => {
        console.log("Connected to the database.");
        this.connectedAt = new Date().getTime();
        this.connection = data.connection;
        this.models = data.models;
        this.cache = new Cache(this);
      });
    this.schemas = {
      users: require("./models/UserSchema"),
      guilds: require("./models/GuildSchema"),
    };
  }
  get(schema, id, key) {
    return this.cache[schema].get(id)?.get(key);
  }
  set(schema, id, key, value) {
    this.emit("update", schema, id, key, value);
    return this.cache[schema].set(id, new Collection().set(key, value));
  }
  push(schema, id, key, value) {
    const current = this.get(schema, id, key) ? this.get(schema, id, key) : [];
    if ((typeof current === "array") | (current.isMongooseArray == false))
      throw new TypeError(`Expected array but got ${typeof current}`);
    current.push(value);
    return this.set(schema, id, key, uniq(current));
  }
  remove(schema, id, key, value) {
    let current = this.get(schema, id, key) ? this.get(schema, id, key) : [];
    if ((typeof current === "array") | (current.isMongooseArray == false))
      throw new TypeError(`Expected array but got ${typeof current}`);
    current = current.remove(value);
    return this.set(schema, id, key, uniq(current));
  }
}

module.exports = Database;
