const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const socketIo = require("../lib/socket-io");
const { HttpError } = require("../lib/errors");
const apiSeletors = require("./api-selectors");

module.exports.getMe = async (req, res) => {
  const { id: userId } = req.user;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: apiSeletors.user,
  });

  user.isFriend = false;

  res.json({ user });
};

module.exports.patchMe = async (req, res) => {
  const { id: userId } = req.user;
  const { alias, description } = matchedData(req);
  const { avatarUrl } = req;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { alias, description, avatarUrl },
    select: apiSeletors.user,
  });

  socketIo.notifyUser("updateUser", userId, {
    id: userId,
    ...(alias ? { alias } : {}),
    ...(description ? { description } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
  });

  res.json({ user });
};

module.exports.getUser = async (req, res) => {
  const { userId } = matchedData(req);
  const { friendshipsA, friendshipsB, ...user } = await prisma.user.findUnique({
    where: { id: userId },
    select: apiSeletors.user,
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({ user });
};
