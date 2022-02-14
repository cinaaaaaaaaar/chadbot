module.exports = async (client, message) => {
  if (message.author.bot || message.author === client.user) return;
  if (message.channel.type !== "GUILD_TEXT") return;

  let aiChannels =
    client.database.get(`guilds.${message.guild.id}.aiChannels`) || [];

  if (aiChannels.includes(message.channel.id))
    return client.generator.ai(message);
};
