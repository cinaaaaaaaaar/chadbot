module.exports = async (client, path, value) => {
  const { schema: schemaString, id, name, key } = path.chunks();
  const schema = require(`../../database/models/${
    schemaString.slice(0, -1).upperFirstChar() + "Schema"
  }`);
  await schema.findOneAndUpdate(
    { _id: id },
    { _id: id, [name]: value },
    { upsert: true }
  );
};
