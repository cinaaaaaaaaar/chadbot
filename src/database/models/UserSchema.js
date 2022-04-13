const mongoose = require("mongoose");
const number = {
  type: Number,
  default: 0,
};
const Schema = new mongoose.Schema({
  _id: String,
  blacklisted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("users", Schema);
