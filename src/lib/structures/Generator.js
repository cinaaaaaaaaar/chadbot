const { MessageAttachment } = require("discord.js");
const NLEmbed = require("./NLEmbed");
const Shotstack = require("shotstack-sdk");

class VideoGenerator {
  constructor(token, basePath) {
    const defaultClient = Shotstack.ApiClient.instance;
    const DeveloperKey = defaultClient.authentications["DeveloperKey"];
    DeveloperKey.apiKey = token;
    defaultClient.basePath = basePath;
    Object.entries(Shotstack).forEach((entry) => {
      this[entry[0]] = entry[1];
    });
    this.api = new Shotstack.EditApi();
  }
}

class Generator {
  constructor(client) {
    this.client = client;
    this.size = Object.keys(this.__proto__).length;
    this.video = new VideoGenerator(
      process.env.SHOTSTACK_TOKEN,
      "https://api.shotstack.io/stage"
    );
  }
  async ai(message) {
    try {
      message.channel.sendTyping();
      if (!message.content) {
        return message.reply("Give me a word");
      }
      const URL = `http://api.brainshop.ai/get?bid=155488&key=${process.env.BRAINSHOP_TOKEN}&uid=${message.author.id}&msg=${message.content}`;
      const { body } = await request.get(URL);
      message.reply(body.cnt).catch(() => {
        message.channel.send("Timeout, please try again later.");
      });
    } catch (e) {
      throw new Error(e);
    }
  }
  async quote(interaction, audio) {
    const URL = `https://inspirobot.me/api?generate=true${
      new Date().getMonth() == 11 ? "&season=xmas" : ""
    }`;
    let file;
    if (audio) {
      const { text: id } = await request.get(
        "https://inspirobot.me/api?getSessionID=1"
      );
      const { body } = await request.get(
        `https://inspirobot.me/api?generateFlow=1&sessionID=${id}`
      );
      file = body.mp3;
    } else file = (await request.get(URL)).text;
    const attachment = new MessageAttachment(
      file,
      `quote.${audio ? "mp3" : "jpg"}`
    );
    interaction.editReply({ files: [attachment] });
  }
}

module.exports = Generator;
