const { MessageAttachment } = require("discord.js");
const NLEmbed = require("./NLEmbed");
const Shotstack = require("shotstack-sdk");
const { get } = require("node-superfetch");
class Generator {
  constructor(client) {
    this.client = client;
    const defaultClient = Shotstack.ApiClient.instance;
    const DeveloperKey = defaultClient.authentications["DeveloperKey"];
    DeveloperKey.apiKey = process.env.SHOTSTACK_STAGE_TOKEN;
    defaultClient.basePath = "https://api.shotstack.io/stage";
  }

  async render(data) {
    const api = new Shotstack.EditApi();
    const render = await api.postRender(data);
    let status = await api.getRender(render.response.id);
    while (status.response.status !== "done") {
      setTimeout(async () => {
        status = await api.getRender(render.response.id);
      }, 5000);
    }
    return (await api.getRender(render.response.id)).response.url;
  }

  async ai(message) {
    message.channel.sendTyping();
    if (!message.content) return message.reply("Give me a word");
    const URL = `http://api.brainshop.ai/get?bid=155488&key=${process.env.BRAINSHOP_TOKEN}&uid=${message.author.id}&msg=${message.content}`;
    const { body } = await get(URL);
    message.reply(body.cnt);
  }

  async quote(interaction, audio) {
    const URL = `https://inspirobot.me/api?generate=true${
      new Date().getMonth() == 11 ? "&season=xmas" : ""
    }`;
    let file;
    if (audio) {
      const { text: id } = await get(
        "https://inspirobot.me/api?getSessionID=1"
      );
      const { body } = await get(
        `https://inspirobot.me/api?generateFlow=1&sessionID=${id}`
      );
      file = body.mp3;
    } else file = (await get(URL)).text;
    const attachment = new MessageAttachment(
      file,
      `quote.${audio ? "mp3" : "jpg"}`
    );
    interaction.editReply({ files: [attachment] });
  }
}

module.exports = Generator;
