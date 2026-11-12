const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v } = m;

const groups = Router();

groups.post("/", m.uploadFile("avatar"), v.postGroup, c.groups.postGroup);

groups.get("/:groupId", v.paramId("groupId"), c.groups.getGroup);

groups.patch(
  "/:groupId",
  v.paramId("groupId"),
  c.groups.checkRole("ADMIN"),
  m.uploadFile("avatar"),
  v.patchGroup,
  c.groups.patchGroup,
);

groups.post(
  "/:groupId/members",
  v.paramId("groupId"),
  c.groups.checkRole("ADMIN"),
  v.postMember,
  c.members.postMember,
);

groups.patch(
  "/:groupId/members/:memberId",
  v.paramId("groupId"),
  v.paramId("memberId"),
  c.groups.checkRole("ADMIN"),
  v.patchMember,
  c.members.patchMember,
);

groups.delete(
  "/:groupId/members/me",
  v.paramId("groupId"),
  c.groups.checkRole("MEMBER"),
  c.members.deleteMemberMe,
);

groups.delete(
  "/:groupId/members/:memberId",
  v.paramId("groupId"),
  v.paramId("memberId"),
  c.groups.checkRole("ADMIN"),
  c.members.deleteMember,
);

module.exports = groups;
