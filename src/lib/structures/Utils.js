const { readdirSync } = require("fs");
const files = readdirSync("./src/lib/utils");

class Utils {
  constructor(client) {
    this.client = client;
    this.size = Object.keys(this.__proto__).length;
    this.classes = require("../utils/extenders");
  }
}

files.forEach((file) => {
  Utils.prototype[file.split(".")[0]] = require(`../utils/${file}`);
});

module.exports = Utils;
