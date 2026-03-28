const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");

module.exports.getGroups = async (req, res) => {
  const { id: userId } = req.user;

  const groups = await prisma.group.findMany({
    where: {
      members: { some: { id: userId } },
    },
  });

  res.json({ groups });
};

module.exports.postGroup = async (req, res) => {
  const { id: userId } = req.user;
  const { name, friendIds } = req.body;

  const connect = [{ id: userId }, ...friendIds.map((id) => ({ id }))];
  const group = await prisma.group.create({
    data: { name, members: { connect } },
  });

  res.json({ group });
};
