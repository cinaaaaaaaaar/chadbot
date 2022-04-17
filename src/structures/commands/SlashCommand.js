class SlashCommand {
  constructor({
    name = "",
    description = "",
    options = [],
    nsfw = false,
    permissions = [],
  }) {
    this.name = name;
    this.description = description;
    this.options = options;
    this.nsfw = nsfw;
    this.permissions = permissions;
  }
}
module.exports = SlashCommand;
