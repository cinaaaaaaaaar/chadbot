const { Intents } = require("discord.js");
const { FLAGS } = Intents;
const NoLimits = require("./lib/NLClient");
const fetch = require("node-fetch");
require("dotenv-flow").config();
fetch("https://www.google.com").catch(() => {
  console.error("No internet connection detected.");
  process.exit(1);
});
const client = new NoLimits({
  intents: [
    FLAGS.GUILDS,
    FLAGS.GUILD_MEMBERS,
    FLAGS.GUILD_VOICE_STATES,
    FLAGS.GUILD_PRESENCES,
    FLAGS.GUILD_MESSAGES,
    FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  allowedMentions: { parse: ["users"], repliedUser: false },
});

require("./lib/loader/commandLoader.js")(client);
require("./lib/loader/eventLoader.js")(client);

client.on("warn", console.warn);
client.on("error", console.error);
client.login(process.env.DISCORD_TOKEN).catch(console.error);

module.exports = {
  Command: require("./lib/structures/Command"),
  NLEmbed: require("./lib/structures/NLEmbed"),
  Client: NoLimits,
};
