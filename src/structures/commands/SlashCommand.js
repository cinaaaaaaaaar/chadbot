const {
  ApplicationCommand: {
    prototype: { options: OptionsResolvable },
  },
  PermissionResolvable,
} = require("discord.js-light");
class SlashCommand {
  /**
   * @typedef {Object} CommandOptions
   * @property {string} name
   * @property {string} description
   * @property {OptionsResolvable} [options]
   * @property {number} [cooldown]
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
    this.cooldown = options.cooldown || 5;
    this.nsfw = options.nsfw || false;
    this.permissions = options.permissions || [];
  }
}
module.exports = SlashCommand;
