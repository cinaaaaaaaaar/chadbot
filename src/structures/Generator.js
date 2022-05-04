const { MessageAttachment } = require("discord.js");
const Embed = require("./Embed");
const Shotstack = require("shotstack-sdk");
const wait = require("util").promisify(setTimeout);
class Generator {
  constructor(client) {
    this.client = client;
    const env = client.config.shotstack_env;
    const defaultClient = Shotstack.ApiClient.instance;
    const DeveloperKey = defaultClient.authentications["DeveloperKey"];
    DeveloperKey.apiKey =
      env === "v1" ? process.env.SHOTSTACK_PROD_TOKEN : process.env.SHOTSTACK_STAGE_TOKEN;
    defaultClient.basePath = `https://api.shotstack.io/${env}`;
  }

  async render(data) {
    const api = new Shotstack.EditApi();
    const render = await api.postRender(data);
    let status = await api.getRender(render.response.id);
    while (status.response.status !== "done") {
      await wait(5000);
      status = await api.getRender(render.response.id);
    }
    return (await api.getRender(render.response.id)).response.url;
  }

  async ai(message) {
    const noContentMessages = [
      "Say something please.",
      "Give me a word.",
      "Say more to me please.",
      "Sorry, I didn't catch what you said. Could you please repeat it again?",
    ];
    message.channel.sendTyping();
    if (!message.content)
      return message.reply(
        noContentMessages[this.client.utils.randomNumber(0, noContentMessages.length)]
      );
    const URL = `http://api.brainshop.ai/get?bid=155488&key=${process.env.BRAINSHOP_TOKEN}&uid=${message.author.id}&msg=${message.content}`;
    const response = await fetch(URL);
    const body = response.json();
    message.reply(body.cnt);
  }

  async quote(interaction, audio) {
    const URL = `https://inspirobot.me/api?generate=true${
      new Date().getMonth() == 11 ? "&season=xmas" : ""
    }`;
    let file;
    if (audio) {
      const response = await fetch("https://inspirobot.me/api?getSessionID=1");
      const id = await response.text();
      const audioResponse = await fetch(
        `https://inspirobot.me/api?generateFlow=1&sessionID=${id}`
      );
      const body = await audioResponse.json();
      file = body.mp3;
    } else file = await (await fetch(URL)).text();
    const attachment = new MessageAttachment(file, `quote.${audio ? "mp3" : "jpg"}`);
    interaction.editReply({ files: [attachment] });
  }
}

module.exports = Generator;
