const mongoose = require("mongoose");
const { prefix } = require("../../../config.json");
const Schema = new mongoose.Schema({
  _id: String,
  prefixes: {
    type: Array,
    default: [prefix],
  },
  aiChannels: {
    type: Array,
    default: [],
  },
  disabledChannels: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("guilds", Schema);
