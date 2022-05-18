const { MessageAttachment } = require("discord.js");
const Embed = require("./Embed");
const Shotstack = require("shotstack-sdk");
const wait = require("util").promisify(setTimeout);
const { Configuration, OpenAIApi } = require("openai");

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

  async ai(content, character, id) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_KEY,
    });

    const openai = new OpenAIApi(configuration);
    const noContentMessages = [
      "Say something please.",
      "Give me a word.",
      "Say more to me please.",
      "Sorry, I didn't catch what you said. Could you please repeat it again?",
    ];
    if (!content)
      return noContentMessages[this.client.utils.randomNumber(0, noContentMessages.length)];

    const prompts = await this.client.database.get("users", id, "aiPromptHistory");
    const prompt = `${prompts
      .map((prompt) => `You: ${prompt.user}\nChadbot: ${prompt.bot}`)
      .join("\n")}\nYou: ${content}\nChadbot:`;
    const characters = {
      friendly: "Chadbot is a friendly chatbot that simulates talking to a friend.",
      sarcastic:
        "Chadbot is a chatbot that reluctantly answers questions with sarcastic responses.",
    };
    const response = await openai.createCompletion("text-davinci-002", {
      prompt: `${characters[character]}\n${prompt}`,
      temperature: 0.5,
      max_tokens: 200,
      top_p: 0.7,
      frequency_penalty: 1.5,
      presence_penalty: 1.5,
    });
    let text = response.data.choices[0].text;
    while (/\s|\n/.test(text.charAt(0))) text = text.slice(1);
    this.client.database.push("users", id, "aiPromptHistory", {
      user: content,
      bot: text,
    });
    return text;
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
