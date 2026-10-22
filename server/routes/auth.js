const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v } = m;

const auth = Router();

auth.get("/unauthenticated", c.auth.getUnauthenticated);
auth.post("/login", v.login, m.passport.authenticate, c.auth.postLogin);
auth.post("/logout", c.auth.postLogout);
auth.get("/protected", m.passport.protect, c.auth.protected);

module.exports = auth;

