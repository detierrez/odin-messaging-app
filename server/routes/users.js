const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v } = m;

const users = Router();

users.get("/me", c.users.getMe);
users.patch("/me", m.uploadFile("avatar"), v.patchMe, c.users.patchMe);
users.get("/:userId", v.paramId("userId"), c.users.getUser);

module.exports = users;

