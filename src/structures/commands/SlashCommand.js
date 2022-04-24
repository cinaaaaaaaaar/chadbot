const {
  ApplicationCommand: {
    prototype: { options: OptionsResolvable },
  },
  PermissionResolvable,
} = require("discord.js");
class SlashCommand {
  /**
   * @typedef {Object} CommandOptions
   * @property {string} name
   * @property {string} description
   * @property {OptionsResolvable} [options]
   * @property {boolean} [nsfw]
   * @property {PermissionResolvable[]} [permissions]
   */
  /**
   *
   * @param {CommandOptions} options
   */
  constructor(options) {
    this.name = options.name;
    this.description = options.description;
    this.options = options.options || [];
    this.nsfw = options.nsfw || false;
    this.permissions = options.permissions || [];
  }
}
module.exports = SlashCommand;
