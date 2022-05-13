const mongoose = require("mongoose");
const Cache = require("./Cache");
const { uniq } = require("lodash");
const { Collection } = require("discord.js");

class Database {
  constructor(uri) {
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
        this.cache = new Cache();
      });
    this.schemas = {
      users: require("./models/UserSchema"),
      guilds: require("./models/GuildSchema"),
    };
  }
  /**
   *
   * @param {string} schema
   * @param {string} id
   * @param {string} key
   */
  async get(schema, id, key) {
    const data = this.cache[schema].get(id) || (await this.saveToCacheOrCreate(schema, id));
    return data.get(key);
  }
  /**
   *
   * @param {string} schema
   * @param {string} id
   * @param {string} key
   * @param {any} value
   * @returns {Collection}
   */
  async set(schema, id, key, value) {
    const Schema = this.schemas[schema];
    if (!this.cache[schema].get(id)) await this.saveToCacheOrCreate(schema, id);
    await Schema.findOneAndUpdate({ _id: id }, { _id: id, [key]: value }, { upsert: true });
    this.cache[schema].get(id).set(key, value);
    return this.cache[schema].get(id).get(key);
  }
  /**
   *
   * @param {string} schema
   * @param {string} id
   * @param {string} key
   * @param {any} value
   * @returns {any[]}
   */
  async push(schema, id, key, value) {
    const current = await this.get(schema, id, key);
    if (typeof current === "array")
      throw new TypeError(`Expected array but got ${typeof current}`);
    current.push(value);
    return await this.set(schema, id, key, uniq(current));
  }
  /**
   *
   * @param {string} schema
   * @param {string} id
   * @param {string} key
   * @returns {Collection}
   */
  async delete(schema, id, key) {
    const defaultData = this.schemas[schema].schema.obj[key].default;
    return this.set(schema, id, key, defaultData);
  }
  /**
   *
   * @param {string} schema
   * @param {string} id
   * @param {string} key
   * @param {any} value
   * @returns {any[]}
   */
  async remove(schema, id, key, value) {
    let current = await this.get(schema, id, key);
    if (typeof current === "array")
      throw new TypeError(`Expected array but got ${typeof current}`);
    current = current.remove(value);
    return await this.set(schema, id, key, uniq(current));
  }
  /**
   * @typedef {Object} item
   * @property {string} id
   * @property {integer} amount
   */
  /**
   *
   * @param {string} id
   * @param {item} item
   */
  async addToInv(user, item) {
    const id = item.id;
    const amount = item.amount > 0 ? item.amount : 1;
    let inventory = await this.get("users", user, "inventory");
    const existingItem = inventory.find((x) => x.id == id);
    if (existingItem) {
      await this.remove("users", user, "inventory", existingItem);
      existingItem.amount += amount;
    } else inventory.push({ id, amount });
    this.set("users", user, "inventory", inventory);
  }
  /**
   *
   * @param {string} id
   * @param {item} item
   */
  async removeFromInv(user, item) {
    const id = item.id;
    const amount = item.amount > 0 ? item.amount : 1;
    let inventory = await this.get("users", user, "inventory");
    const existingItem = inventory.find((x) => x.id == id);
    if (existingItem) {
      existingItem.amount -= amount;
      await this.remove("users", user, "inventory", existingItem);
    } else inventory = inventory.remove({ id, amount });
    this.set("users", user, "inventory", inventory);
  }
  async saveToCacheOrCreate(schema, id) {
    const Schema = this.schemas[schema];
    const existingData = await Schema.findById(id).lean();
    let data = this.cache[schema].get(id);
    if (!existingData) {
      await Schema.create({ _id: id });
      data = await Schema.findById(id).lean();
      data = this.cache.save(schema, id, data);
    } else if (!data) data = this.cache.save(schema, id, existingData);
    return data;
  }
}

module.exports = Database;
