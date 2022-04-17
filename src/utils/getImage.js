module.exports = (interaction, options, dynamic = false) => {
  const urlOptions = { dynamic, format: dynamic ? "gif" : "png" };
  if (!options[0]) return interaction.user.displayAvatarURL(urlOptions);
  if (interaction.client.users.cache.get(options[0]))
    return interaction.client.users.cache.get(options[0]).displayAvatarURL(urlOptions);
  else if (
    (typeof options[0] === "string" && options[0].isURL()) ||
    (typeof options[0] === "string" && /\.(jpeg|jpg|png|mp4)$/.test(options[0]))
  )
    return options[0];
  else if (options[0] == true) return interaction.guild.iconURL(urlOptions);
  else return interaction.user.displayAvatarURL(urlOptions);
};
