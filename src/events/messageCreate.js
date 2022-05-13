const { Message, Collection } = require("discord.js");
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

  if (aiChannels.includes(channelID)) {
    message.channel.sendTyping();
    const response = await client.generator.ai(message.content, message.author.id);
    return message.reply(response);
  }
  if (!prefix) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const commandName = args.shift().toLowerCase();
  const command = client.utils.findCommand(commandName);
  if (!command) return;

  const now = new Date().getTime();
  if (!client.cooldowns.has(authorID)) client.cooldowns.set(authorID, new Collection());
  const userCooldowns = client.cooldowns.get(authorID);
  if (!userCooldowns.has(command.name))
    userCooldowns.set(command.name, { timestamp: now, usedAmount: 1, sentAmount: 0 });
  else {
    const cooldown = userCooldowns.get(command.name);
    const expiry = cooldown.timestamp + command.cooldown * 1000;
    if (expiry > now && cooldown.usedAmount > 2) {
      if (cooldown.sentAmount >= 2) return;
      cooldown.sentAmount++;
      const timeLeft = (expiry - now) / 1000;
      const embed = new Embed()
        .setTitle("Dude, chill!")
        .setDescription(
          `You are using this command too frequently!\nPlease wait **${timeLeft.toFixed(
            1
          )}** seconds.`
        );
      return message.reply({ embeds: [embed] });
    }
  }

  if (command.ownerOnly && !client.config.owners.includes(authorID)) return;
  else if (!message.channel.nsfw && command.nsfw) {
    const embed = new Embed()
      .setTitle("Inappropriate Channel")
      .setDescription("```Please use this command in a NSFW channel.```")
      .setColor("e84d3f");
    return message.reply({
      embeds: [embed],
    });
  } else if (
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
  } else if (args.length < command.args.required?.length) {
    const embed = new Embed()
      .setDescription(`\`\`\`${command.args.required[args.length].message}\`\`\` \n`)
      .setColor("e84d3f");
    return message.reply({
      embeds: [embed],
    });
  }

  try {
    command.run(client, message, args);
    const now = new Date().getTime();
    const cooldown = userCooldowns.get(command.name);
    cooldown.timestamp = now;
    cooldown.usedAmount++;
    setTimeout(() => userCooldowns.delete(command.name), command.cooldown * 1000);
  } catch (error) {
    console.error(error);
    return message.reply("An error occurred during execution.");
  }
};
