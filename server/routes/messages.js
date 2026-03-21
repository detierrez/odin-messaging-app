const { Router } = require("express");
const { getMessages, postMessage } = require("../controllers/messages");
const { logger } = require("../middlewares");
// const { strictAuthenticate, looseAuthenticate } = require("../middlewares");
// const { validateId } = require("../middlewares");

const messages = Router();
messages.get("/", getMessages);
messages.post("/", postMessage);

module.exports = messages;
