const multer = require("multer");

const storage = multer.memoryStorage();
const parseFile = (fieldName) => multer({ storage }).single(fieldName);

module.exports = { parseFile };
