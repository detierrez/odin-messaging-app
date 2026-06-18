const multer = require("multer");

const storage = multer.memoryStorage();

const parseAvatar = multer({ storage }).single("avatar");

module.exports = { parseAvatar };
