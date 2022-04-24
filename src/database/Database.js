const mongoose = require("mongoose");
const Cache = require("./Cache");
const { uniq } = require("lodash");
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
        this.models = data.models;
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
   * @returns Collection
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
   * @returns Collection
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
   * @returns Collection
   */
  async push(schema, id, key, value) {
    const current = await this.get(schema, id, key);
    if ((typeof current === "array") | (current.isMongooseArray == false))
      throw new TypeError(`Expected array but got ${typeof current}`);
    current.push(value);
    return await this.set(schema, id, key, uniq(current));
  }
  /**
   *
   * @param {string} schema
   * @param {string} id
   * @param {string} key
   * @param {any} value
   * @returns Collection
   */
  async remove(schema, id, key, value) {
    let current = await this.get(schema, id, key);
    if (!current) return;
    if (current.isMongooseArray === false)
      throw new TypeError(`Expected array but got ${typeof current}`);
    current = current.remove(value);
    return await this.set(schema, id, key, uniq(current));
  }
  async saveToCacheOrCreate(schema, id) {
    const Schema = this.schemas[schema];
    const existingData = await Schema.findById(id);
    let data = this.cache[schema].get(id);
    if (!existingData) {
      data = await Schema.create({ _id: id });
      data = this.cache.save(schema, id, data);
    } else if (!data) data = this.cache.save(schema, id, existingData);
    return data;
  }
}

module.exports = Database;
