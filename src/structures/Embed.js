const { MessageEmbed } = require("discord.js");
class Embed extends MessageEmbed {
  constructor(data = {}) {
    super(data);
    this.setColor("ffce00").setTimestamp();
  }
}

module.exports = Embed;
