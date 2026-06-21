const multer = require("multer");

const storage = multer.memoryStorage();

const parseAvatar = multer({ storage }).single("avatar");
const parseAttachment = multer({ storage }).single("attachment");

module.exports = { parseAvatar, parseAttachment };
