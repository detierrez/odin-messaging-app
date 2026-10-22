const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v } = m;

const groups = Router();

groups.post("/", m.uploadFile("avatar"), v.postGroup, c.groups.postGroup);

groups.use("/:groupId", v.paramId("groupId"));
groups.get("/:groupId", c.groups.getGroup);
groups.use("/:groupId", c.groups.checkRole("MEMBER"));
groups.delete("/:groupId/members/me", c.members.deleteMemberMe);
groups.use("/:groupId", c.groups.checkRole("ADMIN"));
groups.patch(
  "/:groupId",
  m.uploadFile("avatar"),
  v.patchGroup,
  c.groups.patchGroup,
);
groups.post("/:groupId/members", v.postMember, c.members.postMember);
groups.use("/:groupId/members/:memberId", v.paramId("memberId"));
groups.patch(
  "/:groupId/members/:memberId",
  v.patchMember,
  c.members.patchMember,
);
groups.delete("/:groupId/members/:memberId", c.members.deleteMember);

module.exports = groups;

