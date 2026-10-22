const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v } = m;

const friends = Router();

friends.get("/", c.friends.getFriends);
friends.use("/:friendId", v.paramId("friendId"));
friends.post("/:friendId", c.friends.postFriend);
friends.delete("/:friendId", c.friends.deleteFriend);

module.exports = friends;

