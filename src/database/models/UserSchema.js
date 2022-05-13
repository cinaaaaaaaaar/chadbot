const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
  _id: String,
  blacklisted: {
    type: Boolean,
    default: false,
  },
  aiPromptHistory: {
    type: Array,
    default: [],
  },
  inventory: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("users", Schema);
