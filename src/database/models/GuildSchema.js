const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
  _id: String,
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
