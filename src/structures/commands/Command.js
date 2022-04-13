class Command {
  constructor({
    name = "",
    description = "",
    options = [],
    defaultPermission = true,
    guild = null,
  }) {
    this.data = { name, description, options, defaultPermission, guild };
  }
}
module.exports = Command;
