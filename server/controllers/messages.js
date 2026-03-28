const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");

module.exports.getMessagesByFriend = async (req, res) => {
  const { id: userId } = req.user;
  const { friendId } = matchedData(req);

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromId: userId, toId: friendId },
        { fromId: friendId, toId: userId },
      ],
    },
    orderBy: { id: "asc" }, // TODO by date instead
  });
  res.json({ messages });
};

module.exports.postMessageToFriend = async (req, res) => {
  const { id: userId } = req.user;
  const { friendId } = matchedData(req);
  const { text } = req.body;

  try {
    const lesserId = userId < friendId ? userId : friendId;
    const greaterId = userId >= friendId ? userId : friendId;
    await prisma.friendship.findFirstOrThrow({
      where: { lesserId, greaterId },
    });
  } catch (error) {
    throw new httpError(400, [
      { reason: "This user must be your friend first" },
    ]);
  }

  const message = await prisma.message.create({
    data: { fromId: userId, toId: friendId, text },
  });

  const io = req.app.get("io");
  const { fromId, toId } = message;
  io.to(`${fromId}`).to(`${toId}`).emit("new_message", message);
  res.json({ message: "success" });
};
