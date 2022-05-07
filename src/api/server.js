const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
module.exports = (client) => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", require("./routes/api")(client));
  app.use("/db", require("./routes/database")(client));
  app.listen(port, () => console.log(`API is active on http://localhost:${port}`));
};
