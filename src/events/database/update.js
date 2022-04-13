const Client = require("../../structures/Client");
const schemas = {
  users: require("../../database/models/UserSchema"),
  guilds: require("../../database/models/GuildSchema"),
};
/**
 *
 * @param {Client} client
 * @param {string} schemaName
 * @param {string} id
 * @param {string} key
 * @param {any} value
 */
module.exports = async (client, schemaName, id, key, value) => {
  const schema = schemas[schemaName];
  const data = await client.database.models[schemaName].find().exec();
  if (!data.length > 0) schema.create({ _id: id, [key]: value });
  else
    await schema.findOneAndUpdate(
      { _id: id },
      { _id: id, [key]: value },
      { upsert: true }
    );
};
