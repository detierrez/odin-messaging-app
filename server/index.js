require("dotenv/config");
const { PORT, CLIENT_URL } = process.env;

const { createServer } = require("node:http");
const cors = require("cors");
const express = require("express");
const index = require("./routes");
const { initializeIo } = require("./socket.io");

const app = express();
const server = createServer(app);

initializeIo(server, { cors: { origin: CLIENT_URL } });

app.use(express.json());
app.use(cors({ origin: CLIENT_URL }));
app.use("/", index);

server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
