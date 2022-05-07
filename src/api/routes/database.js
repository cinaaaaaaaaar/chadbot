const express = require("express");

module.exports = (client) => {
  const router = express.Router();
  // const auth = async (req, res, next) => {
  //   if (req.headers.token != process.env.DISCORD_TOKEN)
  //     return res.status(401).json({ message: "Missing Access" });
  //   next();
  // };
  // router.use(auth);
  router.get("/:schema/:id/:key", async (req, res) => {
    const data = await client.database
      .get(req.params.schema, req.params.id, req.params.key)
      .catch((error) => {
        res.status(400).json({ error });
      });
    res.status(200).json({ data });
  });
  router.post("/:schema/:id/:key/:value", async (req, res) => {
    const data = await client.database
      .set(req.params.schema, req.params.id, req.params.key, req.params.value)
      .catch((error) => {
        res.status(400).json({ error });
      });
    res.status(200).json({ data });
  });
  return router;
};
