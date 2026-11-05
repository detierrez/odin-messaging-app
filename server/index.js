require("dotenv/config");
const { initializeIo } = require("./lib/socket-io");
const app = require("./app");

const server = initializeIo(app, { cors: { origin: process.env.CLIENT_URL, credentials: true } });
server.listen(process.env.PORT, () => console.log(`http://localhost:${PORT}`));
