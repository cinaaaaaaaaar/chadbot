module.exports = (client, query, filterOwnerOnly = false) => {
  let filter = (cmd) => cmd.name === query || cmd.aliases.includes(query);
  if (filterOwnerOnly)
    filter = (cmd) =>
      cmd.name === query || (cmd.aliases.includes(query) && cmd.ownerOnly == false);
  return (command = client.categories
    .find((cat) => cat.commands.find(filter))
    ?.commands.find(filter));
};
