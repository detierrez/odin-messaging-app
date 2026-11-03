const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const auth = Router();

auth.post("/login", m.validators.login, m.passport.authenticate, c.auth.postLogin);
auth.post("/logout", c.auth.postLogout);

module.exports = auth;

