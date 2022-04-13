const { Collection } = require("discord.js");
class Cache {
  constructor(database) {
    this.users = new Collection();
    this.guilds = new Collection();
    this.syncData(database);
  }
  async syncData(database) {
    const users = await database.models.users.find().exec();
    const guilds = await database.models.guilds.find().exec();

    users.forEach((user) => {
      this.users.set(user._id, new Collection().set("id", user._id));
      Object.entries(user._doc)
        .filter((x) => !x[0].startsWith("_"))
        .forEach((document) => {
          this.users.get(user._id).set(document[0], document[1]);
        });
    });

    guilds.forEach((guild) => {
      this.guilds.set(guild._id, new Collection().set("id", guild._id));
      Object.entries(guild._doc)
        .filter((x) => !x[0].startsWith("_"))
        .forEach((document) => {
          this.guilds.get(guild._id).set(document[0], document[1]);
        });
    });
  }
}

module.exports = Cache;
