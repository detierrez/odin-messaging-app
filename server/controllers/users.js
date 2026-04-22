const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { genericUserSelect } = require("./apiSelects");
const { httpError } = require("../middlewares");
const { notifyUser } = require("../socket.io");

module.exports.getMe = async (req, res) => {
  const { id: userId } = req.user;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: genericUserSelect,
  });

  res.json({ user });
};

module.exports.patchMe = async (req, res) => {
  const { id: userId } = req.user;
  const { description } = matchedData(req);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { description },
    select: genericUserSelect,
  });

  notifyUser("update_profile", userId, {
    description: user.description,
    avatarUrl: user.avatarUrl,
  });

  res.json({ success: true });
};

module.exports.getUser = async (req, res) => {
  const { userId } = matchedData(req);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: genericUserSelect,
  });

  if (!user) {
    throw new httpError(404, [{ reason: "User not found" }]);
  }

  res.json({ user });
};
