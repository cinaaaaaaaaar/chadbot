const { CommandInteraction, Collection } = require("discord.js-light");
const { Client, Embed } = require("..");

/**
 *
 * @param {Client} client
 * @param {CommandInteraction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
  const userID = interaction.user.id;
  if (interaction.isCommand()) {
    if (!interaction.guild)
      await interaction.reply("Slash commands can only be used in servers.");
    await interaction.deferReply();
    const command = client.commands.get(interaction.commandName);
    const options = interaction.options.data.map((data) => data.value);
    const hasPermissions = !command.permissions.every((v) =>
      interaction.member.permissions.toArray().includes(v)
    );
    const requiredPermissions = command.permissions.map((perm) => `\`${perm}\``).join(", ");
    if (hasPermissions)
      interaction.editReply({
        embeds: [
          {
            title: "Missing Permissions",
            description: `**Required:** ${requiredPermissions}`,
          },
        ],
      });
    if (!interaction.channel.nsfw && command.nsfw)
      return interaction.editReply({
        embeds: [
          {
            title: "Inappropriate Channel",
            description: "```Please use this command in a NSFW channel.```",
            color: "e84d3f",
          },
        ],
      });

    const now = new Date().getTime();
    if (!client.cooldowns.slash.has(userID))
      client.cooldowns.slash.set(userID, new Collection());
    const userCooldowns = client.cooldowns.slash.get(userID);
    if (!userCooldowns.has(command.name))
      userCooldowns.set(command.name, { timestamp: now, usedAmount: 1, sentAmount: 0 });
    else {
      const cooldown = userCooldowns.get(command.name);
      const expiry = cooldown.timestamp + command.cooldown * 1000;
      if (expiry > now && cooldown.usedAmount > 2) {
        const timeLeft = (expiry - now) / 1000;
        const embed = new Embed()
          .setTitle("Dude, chill!")
          .setDescription(
            `You are using this command too frequently!\nPlease wait **${timeLeft.toFixed(
              1
            )}** seconds.`
          );
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }
    }
    try {
      command.run(client, interaction, options, interaction.options);
      const now = new Date().getTime();
      const cooldown = userCooldowns.get(command.name);
      cooldown.timestamp = now;
      cooldown.usedAmount++;
      setTimeout(() => userCooldowns.delete(command.name), command.cooldown * 1000);
    } catch (error) {
      console.error(error);
      return interaction.editReply("An error occurred during execution.");
    }
  }
  if (interaction.isButton() && interaction.customId !== "custom_button")
    await interaction.deferUpdate();
};
