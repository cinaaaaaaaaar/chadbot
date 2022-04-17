const { Message, Permissions } = require("discord.js");
const { Embed } = require("..");
const Client = require("../structures/Client");

/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  const guildID = message.guild.id;
  const authorID = message.author.id;
  const channelID = message.channel.id;
  if (message.author.bot || message.author === client.user) return;
  if (message.channel.type !== "GUILD_TEXT") return;

  const prefixes = await client.database.get("guilds", guildID, "prefixes");
  const aiChannels = await client.database.get("guilds", guildID, "aiChannels");
  const prefix = prefixes.find((x) => message.content.startsWith(x));

  if (
    message.content.split(" ")[0].isMention() &&
    message.mentions.users.first().id == client.user.id
  )
    return message.reply(
      `My ${prefixes.length > 1 ? "prefixes are" : "prefix is"} \`${prefixes.join(", ")}\``
    );

  if (aiChannels.includes(channelID)) return client.generator.ai(message);
  if (!prefix) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const commandName = args.shift().toLowerCase();
  const command = client.utils.findCommand(client, commandName);
  if (!command) return;
  if (command.ownerOnly && !client.config.owners.includes(authorID))
    return message.channel.stopTyping();
  else if (!message.channel.nsfw && command.nsfw) {
    const embed = new Embed()
      .setTitle("Inappropriate Channel")
      .setDescription("```Please use this command in a NSFW channel.```")
      .setColor("e84d3f");
    return message.reply({
      embeds: [embed],
    });
  } else if (
    command.permissions.length > 0 &&
    !command.permissions.every((v) => message.member.permissions.toArray().includes(v))
  ) {
    const formattedPermissions = command.permissions.map((x) => `\`${x}\``).join(", ");
    const embed = new Embed()
      .setTitle("Missing Permissions")
      .setDescription(`**Required:** ${formattedPermissions}`)
      .setColor("e84d3f");
    return message.reply({
      embeds: [embed],
    });
  } else if (args && command.args && args.length < command.args.required?.length) {
    const embed = new Embed()
      .setDescription(`\`\`\`${command.args.required[args.length].message}\`\`\` \n`)
      .setColor("e84d3f");
    return message.reply({
      embeds: [embed],
    });
  }

  command.run(client, message, args).catch((error) => {
    console.error(error);
    return message.reply("An error occured during execution.");
  });
};
