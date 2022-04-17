const { exec } = require("child_process");
const { Command } = require("../../");
class ExecuteCommand extends Command {
  constructor() {
    super({
      name: "execute",
      description: "Execute something with a single command.",
      aliases: ["exec"],
      ownerOnly: true,
      args: {
        required: ["command"],
        message: "Enter a command to execute.",
      },
    });
  }
  async run(client, message, args) {
    exec(args.join(" ").trim(), (error, stdout) => {
      const response = error || stdout;
      message.reply("```" + response + "```");
      return;
    });
  }
}

module.exports = ExecuteCommand;
