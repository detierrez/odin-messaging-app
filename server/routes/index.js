const { Router } = require("express");
const m = require("../middlewares");
const auth = require("./auth");
const users = require("./users");
const requests = require("./requests");
const friends = require("./friends");
const groups = require("./groups");
const chats = require("./chats");

const { errors: e } = m;

const index = Router();
index.use(m.debug.logger);
index.use(m.session);
index.use(m.passport.session);
index.use("/", auth);
index.use("/users", m.passport.protect, users);
index.use("/requests", m.passport.protect, requests);
index.use("/friends", m.passport.protect, friends);
index.use("/groups", m.passport.protect, groups);
index.use("/chats", m.passport.protect, chats);
index.use(e.throwNotFoundError, e.maskInternalErrors, e.respondWithError);

module.exports = index;
