const { PermissionResolvable } = require("discord.js");
class Command {
  /**
   *
   * @typedef {Object[]} Required
   * @property {string} name
   * @property {string} message
   */
  /**
   *
   * @typedef {Object} CommandArgs
   * @property {Required} [required]
   * @property {string[]} [optional]
   */
  /**
   *
   * @typedef {Object} Data
   * @property {string} name
   * @property {string} description
   * @property {number} [cooldown]
   * @property {string[]} [aliases]
   * @property {CommandArgs} [args]
   * @property {boolean} [ownerOnly]
   * @property {boolean} [nsfw]
   * @property {PermissionResolvable[]} [permissions]
   *
   */
  /**
   *
   * @param {Data} data
   */
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.cooldown = data.cooldown || 7.5;
    this.aliases = data.aliases || [];
    this.args = data.args || { required: [], optional: [] };
    this.nsfw = data.nsfw || false;
    this.ownerOnly = data.ownerOnly || false;
    this.permissions = data.permissions || ["SEND_MESSAGES"];
  }
}
module.exports = Command;
