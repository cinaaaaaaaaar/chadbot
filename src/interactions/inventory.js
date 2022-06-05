const { SlashCommand, Client, Embed } = require("..");
const { CommandInteraction, CommandInteractionOptionResolver } = require("discord.js-light");
class InventoryCommand extends SlashCommand {
  constructor() {
    super({
      name: "inventory",
      description: "Sends the given users inventory",
      options: [
        {
          name: "user",
          description: "The user you want to check the inventory of",
          type: "USER",
          required: false,
        },
        {
          name: "page",
          type: "INTEGER",
          description: "The page you want to view",
          required: false,
        },
      ],
    });
  }
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {Array} args
   * @param {CommandInteractionOptionResolver} options
   */
  async run(client, interaction, args, options) {
    const user = options.getUser("user", false) || interaction.user;
    const inventory = await client.database.get("users", user.id, "inventory");
    if (inventory.length <= 0) {
      const embed = new Embed()
        .setTitle(`${user.username}${user.username.endsWith("s") ? "'" : "'s"} Inventory`)
        .setDescription("Oh no! Nothing interesting here.");
      return interaction.editReply({ embeds: [embed] });
    }
    const shop = client.assets.json.shop;
    const pages = inventory.paginate(2);
    const pageValue = options.get("page")?.value - 1;
    let page = pageValue >= 0 && pageValue < pages.length ? pageValue : 0;
    const embeds = [];
    pages.forEach((page, i) => {
      const embed = new Embed()
        .setTitle(`${user.username}${user.username.endsWith("s") ? "'" : "'s"} Inventory`)
        .setFooter({
          text: `Page ${i + 1}/${pages.length}`,
        });
      page.forEach((item) => {
        const itemData = shop.find((x) => x.id === item.id);
        embed.addField(
          itemData.name,
          `**Price:** ${itemData.price.toLocaleString()}\n**Amount** ${item.amount.toLocaleString()}\n**ID:** \`${
            itemData.id
          }\``
        );
      });
      embeds.push(embed);
    });
    client.utils.paginate(interaction, interaction.user, embeds, page);
  }
}

module.exports = InventoryCommand;
