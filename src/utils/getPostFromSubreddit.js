const randomNumber = require("../utils/randomNumber");
const { get } = require("node-superfetch");
module.exports = async (subreddit = "", post_hint = "", nsfw = false) => {
  const url = `https://reddit.com/r/${subreddit}/top/.json?limit=75`;
  const { body } = await get(url);
  const filtered = nsfw
    ? body.data.children.filter((x) => x.data.post_hint === post_hint)
    : body.data.children.filter(
        (x) => x.data.post_hint === post_hint && !x.data.over_18
      );
  return filtered[randomNumber(0, filtered.length - 1)].data;
};
