module.exports = async (client) => {
  const now = new Date();
  console.log(
    `${client.user.username} is online in ${
      client.guilds.cache.size
    } servers. [${now.toLocaleTimeString()}]`
  );
};
