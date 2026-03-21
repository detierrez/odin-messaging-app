const { Router } = require("express");
const { getRocks } = require("../controllers/rocks");
// const { strictAuthenticate, looseAuthenticate } = require("../middlewares");
// const { validateId } = require("../middlewares");

const rocks = Router();

rocks.get("/", getRocks);

module.exports = rocks;
