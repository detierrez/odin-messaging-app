require("dotenv/config");
const { PORT, CLIENT_URL } = process.env;

const { createServer } = require("node:http");
const cors = require("cors");
const express = require("express");
const { Server } = require("socket.io");
const m = require("./middlewares");
const index = require("./routes");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_URL } });

// HTTP Server
app.set("io", io);
app.use(express.json());
app.use(cors(CLIENT_URL));
app.use("/", index);

// WebSocket Server
io.on("connection", (socket) => {
  console.log("a user connected");
});

server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
