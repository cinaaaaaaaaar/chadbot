const { readdirSync } = require("fs");

module.exports = (client) => {
  const files = readdirSync("./src/events/");
  files.forEach((file) => {
    if (!file.endsWith(".js")) {
      const events = readdirSync(`./src/events/${file}`);
      events.forEach((event) => {
        client[file].on(event.split(".")[0], (...args) =>
          require(`../../events/${file}/${event}`)(client, ...args)
        );
      });
    }

    client.on(file.split(".")[0], (...args) =>
      require(`../../events/${file}`)(client, ...args)
    );
  });
};
