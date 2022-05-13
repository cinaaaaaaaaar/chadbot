const express = require("express");

module.exports = (client) => {
  const router = express.Router();
  // // const auth = async (req, res, next) => {
  // //   if (req.headers.token != process.env.DISCORD_TOKEN)
  // //     return res.status(401).json({ message: "Missing Access" });
  // //   next();
  // // };
  // router.use(auth);
  router.get("/commands", (req, res) => {
    const categories = client.categories;
    const slash = client.commands;
    res.status(200).json({ categories, slash });
  });
  router.get("/stats", (req, res) => {
    res.status(200).json({
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
      ping: client.ws.ping,
    });
  });
  router.get("/ai", async (req, res) => {
    const response = await client.generator.ai(req.query.content, req.query.id);
    res.status(200).json({
      response,
    });
  });
  return router;
};
