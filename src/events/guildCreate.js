module.exports = (client, guild) => {
  if (!client.database.cache.guilds.find((x) => x.id == guild.id))
    client.database.create("guilds", guild.id);
  let selected;
  guild.channels.cache.forEach((channel) => {
    if (
      channel.type == "text" &&
      channel.permissionsFor(guild.me).has("SEND_MESSAGES") &&
      !selected
    )
      selected = channel;
  });
  if (!selected) return;
  selected.send({
    embeds: [
      {
        description:
          "Beep beep 🤖 I'm **NoLimits**. Use `n.help` to check my commands!",
        color: "e84d3f",
      },
    ],
  });
};
