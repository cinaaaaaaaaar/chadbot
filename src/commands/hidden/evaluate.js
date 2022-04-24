const { create } = require("sourcebin");
const { Embed, Command } = require("../../");
class EvalCommand extends Command {
  constructor() {
    super({
      name: "evaluate",
      description: "Evaluate some code",
      aliases: ["eval"],
      args: {
        required: [
          {
            name: "code",
            message: "Please write the code.",
          },
        ],
      },
      ownerOnly: true,
    });
  }
  async run(client, message, args) {
    const code = getCode(args.join(" "));
    const embed = new Embed().addField("Input", "```js\n" + code + "```");

    try {
      const evaled = eval(code);
      let output = typeof evaled === "string" ? evaled.clean() : evaled.toString().clean();
      if (output.length < 1024) embed.addField("Output", "```js\n" + output + "```");
      else {
        const value = await create([
          {
            name: "evaled",
            content: output,
            language: "javascript",
          },
        ]);
        embed.addField("Output", value.url);
      }
    } catch (rawError) {
      let error =
        typeof rawError === "string" ? rawError.clean() : rawError.toString().clean();
      embed.setColor("e84d3f");
      if (error.length < 1024) embed.addField("Output", "```js\n" + error + "```");
      else {
        const value = await create([
          {
            name: "evaled",
            content: error,
            language: "javascript",
          },
        ]);
        embed.addField("Output", value.url);
      }
    }
    message.reply({ embeds: [embed] });
  }
}

module.exports = EvalCommand;

function getCode(string) {
  let regex = /```(?:(\S+)\n)?\s*([^]+?)\s*```/i;
  return regex.test(string) ? (regex.exec(string) ? regex.exec(string)[2] : string) : string;
}
