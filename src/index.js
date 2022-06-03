const { Intents, Options } = require("discord.js-light");
const Client = require("./structures/Client");
require("dotenv").config();
require("./extenders");
const client = new Client({
  token: process.env.DISCORD_TOKEN,
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
  makeCache: Options.cacheWithLimits({
    ApplicationCommandManager: Infinity,
    BaseGuildEmojiManager: 0,
    ChannelManager: Infinity,
    GuildBanManager: 0,
    GuildChannelManager: Infinity,
    GuildEmojiManager: Infinity,
    GuildInviteManager: Infinity,
    GuildManager: Infinity,
    GuildMemberManager: Infinity,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    MessageManager: 25,
    PermissionOverwriteManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    RoleManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    UserManager: Infinity,
    VoiceStateManager: 0,
  }),
  allowedMentions: { parse: ["users"], repliedUser: false },
});
require("./api/server")(client);
module.exports = {
  Command: require("./structures/commands/Command"),
  SlashCommand: require("./structures/commands/SlashCommand"),
  Embed: require("./structures/Embed"),
  Client: client,
};
