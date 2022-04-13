const RedditCommand = require("../../structures/commands/RedditCommand");
class ShitpostCommand extends RedditCommand {
  constructor() {
    super({
      name: "shitpost",
      description: "Some high quality stuff here!",
      subreddits: ["shitposting", "196"],
      postHint: "image"
    });
  }
}

module.exports = ShitpostCommand;
