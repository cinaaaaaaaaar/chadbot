module.exports = async (client) => {
  const now = new Date();
  client.user.setPresence({
    activities: [{ name: `@${client.user.username} || ${client.config.prefix}help` }],
    status: "dnd",
  });
  console.log(
    `${client.user.username} is online in ${
      client.guilds.cache.size
    } servers. [${now.toLocaleTimeString()}]`
  );
};
