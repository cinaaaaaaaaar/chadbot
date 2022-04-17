const Client = require("../Client");
const { Command, SlashCommand, Embed } = require("../..");
const { CommandInteraction } = require("discord.js");
const { get } = require("node-superfetch");

class RedditCommand extends Command {}

class RedditSlashCommand extends SlashCommand {
  constructor({
    name = "",
    description = "",
    options = [],
    defaultPermission = true,
    guild = null,
    nsfw = false,
    permissions = [],
    subreddits = [],
    postHint,
    embedTitle = "",
    addSubredditFooter = true,
    addUpvotesFooter = true,
  }) {
    super({
      name,
      description,
      options,
      defaultPermission,
      guild,
      nsfw,
      permissions,
    });
    this.params = {
      subreddits,
      postHint,
      embedTitle,
      addSubredditFooter,
      addUpvotesFooter,
      nsfw,
      permissions,
    };
  }
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async run(client, interaction) {
    const subreddit =
      this.params.subreddits[
        client.utils.randomNumber(0, this.params.subreddits.length - 1)
      ];
    const post = await client.utils.getPostFromSubreddit(
      subreddit,
      this.params.postHint,
      true
    );
    const embed = new Embed()
      .setTitle(this.params.embedTitle ? this.params.embedTitle : post.title)
      .setURL(`https://reddit.com${post.permalink}`)
      .setTimestamp();

    if (this.params.postHint === "text") embed.setDescription(post.description);
    else if (this.params.postHint === "image") embed.setImage(post.url);

    if (this.params.addSubredditFooter)
      embed.setFooter({
        text: `🔼 ${post.ups}`,
      });

    if (this.params.addSubredditFooter) {
      const url = `https://reddit.com/r/${subreddit}/about.json`;
      const { body } = await get(url);
      const iconURL = body.data.community_icon.replace(/amp;/g, "");
      embed.setAuthor({
        name: `r/${subreddit}`,
        iconURL,
      });
    }
    interaction.editReply({ embeds: [embed] });
  }
}

module.exports = {
  RedditCommand,
  RedditSlashCommand,
};
