const { Command, Client } = require("../..");
const { Message } = require("discord.js");
class ClearPromptHistoryCommand extends Command {
  constructor() {
    super({
      name: "clear_chatbot_history",
      description:
        "Clears the history of your chat with the AI chatbot so you can start a new one.",
      aliases: ["clear_prompt_history", "cch", "start_new_chatbot"],
    });
  }
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {any[]} args
   */
  async run(client, message, args) {
    client.database.delete("users", message.author.id, "aiPromptHistory");
    message.reply(
      "Deleted the chat history. You can now start a new conversation with the chatbot."
    );
  }
}

module.exports = ClearPromptHistoryCommand;
