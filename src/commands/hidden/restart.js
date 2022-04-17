const { Command } = require("../../");
const { exec } = require("child_process");
class RestartCommand extends Command {
  constructor() {
    super({
      name: "restart",
      description: "Restarts the bot.",
      aliases: ["rs"],
      ownerOnly: true,
    });
  }
  async run(client, message, args) {
    if (process.env.ENVIRONMENT === "PROD") exec(`pm2 restart ${process.env.PM2_NAME}`);
    else return;
    message.reply("Restarting.");
  }
}

module.exports = RestartCommand;
