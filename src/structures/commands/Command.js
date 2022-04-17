class Command {
  constructor({
    name = "",
    description = "",
    cooldown = 7.5,
    aliases = [],
    args = { required: null, optional: null, message: "" },
    nsfw = false,
    ownerOnly = false,
    permissions = [],
  }) {
    this.name = name;
    this.description = description;
    this.cooldown = cooldown;
    this.aliases = aliases;
    this.args = args;
    this.nsfw = nsfw;
    this.ownerOnly = ownerOnly;
    this.permissions = permissions;
  }
}
module.exports = Command;
