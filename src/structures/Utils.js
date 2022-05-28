const { Interaction, MessageButton, MessageActionRow } = require("discord.js-light");
const Search = require("fuzzysearch-js");
let levenshteinFS = require("fuzzysearch-js/js/modules/LevenshteinFS");
let indexOfFS = require("fuzzysearch-js/js/modules/IndexOfFS");
let wordCountFS = require("fuzzysearch-js/js/modules/WordCountFS");
const mime = require("mime-types");
class Utils {
  /**
   *
   * @param {Client} client
   */
  constructor(client) {
    this.#loadWords();
    this.client = client;
  }
  /**
   *
   * @param {string[]} data
   * @param {string} query
   */
  autocomplete(data, query) {
    if (data.includes(query)) return query;
    const search = new Search(data, { minimumScore: 300 });
    search.addModule(levenshteinFS({ maxDistanceTolerance: 3, factor: 3 }));
    search.addModule(indexOfFS({ minTermLength: 3, maxIterations: 500, factor: 3 }));
    search.addModule(wordCountFS({ maxWordTolerance: 3, factor: 1 }));
    const result = search.search(query)?.[0].value;
    return result;
  }
  /**
   * @param {string} query
   * @param {boolean} filterOwnerOnly
   */
  getWeightedProbability(weights) {
    let total = 0;
    weights.forEach((weight) => {
      total += weight;
    });
    let normalized = weights.map((weight) => weight / total);
    for (let i = 1; i < weights.length; i++) {
      normalized[i] = normalized[i - 1] + normalized[i];
    }
    const random = Math.random();
    let i = 0;
    while (i < normalized.length && random > normalized[i]) {
      i++;
    }
    return i;
  }
  addArrowButtons(arrows, addCancel = false) {
    const buttons = [];
    arrows.forEach((arrow, i) => {
      const button = new MessageButton()
        .setEmoji(arrow)
        .setStyle("PRIMARY")
        .setCustomId(i.toString());
      buttons.push(button);
    });
    if (addCancel) {
      const cancel = new MessageButton()
        .setEmoji(this.client.assets.json.emotes.buttons.cancel)
        .setStyle("DANGER")
        .setCustomId("cancel");
      buttons.push(cancel);
    }
    const row = new MessageActionRow().setComponents(buttons);
    return row;
  }
  findCommand(query, filterOwnerOnly = false) {
    const data = [];
    const categories = filterOwnerOnly
      ? this.client.categories.filter((category) => !category.module.hide)
      : this.client.categories;
    categories.forEach((category) => {
      category.commands.forEach((command) => {
        data.push(command.name);
        command.aliases.forEach((alias) => {
          data.push(alias);
        });
      });
    });
    const command = this.autocomplete(data, query);
    let filter = (cmd) => cmd.name === command || cmd.aliases.includes(command);
    return categories.find((cat) => cat.commands.find(filter))?.commands.find(filter);
  }
  getCommandSize() {
    return this.client.categories
      .map((cat) => cat.commands.size)
      .reduce((prev, curr) => prev + curr);
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
   * @param {string} subreddit
   * @param {string} post_hint
   * @param {boolean} nsfw
   * @returns {Object[]} Array of posts
   */
  async getPostFromSubreddit(subreddit, post_hint, nsfw = false) {
    const url = `https://reddit.com/r/${subreddit}/top/.json?limit=75`;
    const response = await fetch(url);
    const body = await response.json();
    const filtered = nsfw
      ? body.data.children.filter((x) => x.data.post_hint === post_hint)
      : body.data.children.filter((x) => x.data.post_hint === post_hint && !x.data.over_18);
    return filtered[randomNumber(0, filtered.length - 1)].data;
  }
  async validateType(url, types) {
    try {
      const response = await fetch(url);
      const mimetype = response.headers.get("content-type");
      const type = mime.extension(mimetype);
      return types.includes(type);
    } catch {
      return false;
    }
  }
  randomNumber(min, max) {
    min = min ?? 0;
    return Math.floor(Math.random() * (max - min)) + min;
  }
  randomWord() {
    const words = this.words.filter((word) => /^.{4,}$/.test(word));
    return words[this.randomNumber(0, words.length)];
  }
  async #loadWords() {
    const response = await fetch(
      "https://raw.githubusercontent.com/dariusk/corpora/master/data/words/common.json"
    );
    this.words = (await response.json()).commonWords;
  }
}

module.exports = Utils;
