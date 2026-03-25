const { matchedData } = require("express-validator/lib");
const prisma = require("../lib/prisma");

module.exports.getFriends = async (req, res) => {
  const { id: userId } = req.user;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ lesserId: userId }, { greaterId: userId }],
    },
    include: {
      lesserIdUser: true,
      greaterIdUser: true,
    },
  });

  const friends = friendships.map((f) =>
    f.lesserId === userId ? f.greaterIdUser : f.lesserIdUser,
  );

  res.json(friends);
};

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
  res.json(messages);
};

module.exports.postMessageToFriend = async (req, res) => {
  const { id } = req.user;
  const { friendId } = matchedData(req);
  const { text } = req.body;

  const message = await prisma.message.create({
    data: { fromId: id, toId: friendId, text },
  });

  const io = req.app.get("io");
  const { fromId, toId } = message;
  io.to(`${fromId}`).to(`${toId}`).emit("new_message", message);
  res.json("success");
};

module.exports.getInbox = async (req, res) => {
  const { id: userId } = req.user;

  const result = await prisma.$queryRaw`
    SELECT "id", "fromId", "toId", "text" FROM (
      SELECT DISTINCT ON ("friendId") *
      FROM (
        SELECT *, CASE WHEN "fromId" = ${userId} THEN "toId" ELSE "fromId" END AS "friendId"
        FROM "Message"
        WHERE "fromId" = ${userId} OR "toId" = ${userId}
      ) AS "messagesWithFriend"
      ORDER BY "friendId", "id" DESC
    ) AS "distinctMessages"
    ORDER BY "id" DESC
  `;

  res.json(result);
};
