require("dotenv/config");
const { PORT, CLIENT_URL: origin } = process.env;

const { createServer } = require("node:http");
const cors = require("cors");
const express = require("express");
const index = require("./routes");
const { initializeIo } = require("./socket.io");

const app = express();
const server = createServer(app);
initializeIo(server, { cors: { origin } });

app.use(express.json());
app.use(cors({ origin }));
app.use("/", index);

server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
