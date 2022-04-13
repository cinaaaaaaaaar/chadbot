const { Intents } = require("discord.js");
const Client = require("./structures/Client");
require("dotenv-flow").config();
const client = new Client({
  token: process.env.DISCORD_TOKEN,
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  allowedMentions: { parse: ["users"], repliedUser: false },
});


module.exports = {
  Command: require("./structures/commands/Command"),
  NLEmbed: require("./structures/NLEmbed"),
  Client,
};
