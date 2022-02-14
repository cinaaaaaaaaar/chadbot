const Database = require("./Database");
const mongoose = require("mongoose");

class Cache {
  /**
   *
   * @param {mongoose} data
   * @param {Database} database
   */
  constructor(data, database) {
    (async () => {
      this.guilds = await data.models.guilds.find().exec();
      this.users = await data.models.users.find().exec();
      this.database = database;
    })();
  }
  get(path) {
    const { schema, id, name } = path.chunks();
    let data = this[schema].find((x) => x._id === id);
    if (!data) this.database.create([schema], id);
    data = this[schema].find((x) => x._id === id);
    return data[name];
  }
  set(path, value) {
    const { schema, id, name } = path.chunks();
    this.database.emit("cacheUpdate", path, value);
    return (this[schema].find((x) => x._id == id)[name] = value);
  }
}

module.exports = Cache;
