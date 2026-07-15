require("dotenv/config");
const { PORT, CLIENT_URL: origin } = process.env;

const cors = require("cors");
const express = require("express");
const index = require("./routes");
const { initializeIo } = require("./lib/socket-io");

const app = express();
app.use(express.json());
app.use(cors({ origin, credentials: true }));
app.use("/", index);

const server = initializeIo(app, { cors: { origin } });
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
