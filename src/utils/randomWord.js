const fetch = require("node-fetch");
module.exports = async () => {
  const text = await (
    await fetch(
      "https://raw.githubusercontent.com/dariusk/corpora/master/data/words/common.json"
    )
  ).json();

  const words = text.commonWords.filter((word) => /^.{4,}$/.test(word));
  return words[Math.floor(Math.random() * words.length)];
};
