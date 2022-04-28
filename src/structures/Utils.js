const { Interaction } = require("discord.js");

const { get } = require("node-superfetch");
class Utils {
  constructor(client) {
    this.#loadWords();
    this.client = client;
  }
  /**
   * @param {string} query
   * @param {boolean} filterOwnerOnly
   */
  findCommand(query, filterOwnerOnly = false) {
    let filter = (cmd) => cmd.name === query || cmd.aliases.includes(query);
    if (filterOwnerOnly)
      filter = (cmd) =>
        cmd.name === query || (cmd.aliases.includes(query) && cmd.ownerOnly === false);
    return this.client.categories
      .find((cat) => cat.commands.find(filter))
      ?.commands.find(filter);
  }
  /**
   *
   * @param {Interaction} interaction
   * @param {any[]} options
   * @param {boolean} dynamic
   * @returns {string} URL
   */
  getImage(interaction, options, dynamic = false) {
    const urlOptions = { dynamic, format: dynamic ? "gif" : "png" };
    if (!options[0]) return interaction.user.displayAvatarURL(urlOptions);
    if (this.client.users.cache.get(options[0]))
      return this.client.users.cache.get(options[0]).displayAvatarURL(urlOptions);
    else if (
      (typeof options[0] === "string" && options[0].isURL()) ||
      (typeof options[0] === "string" && /\.(jpeg|jpg|png|mp4)$/.test(options[0]))
    )
      return options[0];
    else if (options[0] == true) return interaction.guild.iconURL(urlOptions);
    else return interaction.user.displayAvatarURL(urlOptions);
  }
  /**
   *
   * @param {string} subreddit
   * @param {string} post_hint
   * @param {boolean} nsfw
   * @returns {Object[]} Array of posts
   */
  async getPostFromSubreddit(subreddit, post_hint, nsfw = false) {
    const url = `https://reddit.com/r/${subreddit}/top/.json?limit=75`;
    const { body } = await get(url);
    const filtered = nsfw
      ? body.data.children.filter((x) => x.data.post_hint === post_hint)
      : body.data.children.filter((x) => x.data.post_hint === post_hint && !x.data.over_18);
    return filtered[randomNumber(0, filtered.length - 1)].data;
  }
  randomNumber(min, max) {
    min = min ?? 0;
    return Math.floor(Math.random() * (max - min)) + min;
  }
  randomWord() {
    const words = this.words.commonWords.filter((word) => /^.{4,}$/.test(word));
    return words[this.randomNumber(0, words.length)];
  }
  async #loadWords() {
    this.words = (
      await get(
        "https://raw.githubusercontent.com/dariusk/corpora/master/data/words/common.json"
      )
    ).body;
  }
}

module.exports = Utils;
