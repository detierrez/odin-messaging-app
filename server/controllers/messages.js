const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");

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

  res.json({ friends });
};

module.exports.deleteFriend = async (req, res) => {
  const { id: userId } = req.user;
  const { friendId } = matchedData(req);

  if (userId === friendId) {
    throw new httpError(400, [{ reason: "You cannot unfriend yourself" }]);
  }

  const lesserId = userId < friendId ? userId : friendId;
  const greaterId = userId >= friendId ? userId : friendId;

  await prisma.friendship.delete({
    where: { lesserId_greaterId: { lesserId, greaterId } },
  });

  res.json({ message: "success" });
};

module.exports.postRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { toId } = req.body;

  if (userId === toId) {
    throw new httpError(400, [{ reason: "Cannot send a request to yourself" }]);
  }

  const lesserId = userId < toId ? userId : toId;
  const greaterId = userId >= toId ? userId : toId;

  const [existingFriendship, existingRequest] = await Promise.all([
    prisma.friendship.findUnique({
      where: { lesserId_greaterId: { lesserId, greaterId } },
    }),
    prisma.request.findFirst({
      where: {
        OR: [
          { fromId: userId, toId: toId },
          { fromId: toId, toId: userId },
        ],
      },
    }),
  ]);

  if (existingFriendship) {
    throw new httpError(400, [{ reason: "You are already friends" }]);
  }
  if (existingRequest) {
    throw new httpError(400, [
      { reason: "A request already exists between these users" },
    ]);
  }

  try {
    const request = await prisma.request.create({
      data: { fromId: userId, toId },
    });
    res.json(request);
  } catch (error) {
    if (error.code === "P2002") {
      throw new httpError(400, [{ reason: "A request already exists" }]);
    }
    throw error;
  }
};

module.exports.getRequests = async (req, res) => {
  const { id: userId } = req.user;
  const { direction } = req.query;

  const where = {};
  if (direction === "incoming") {
    where.toId = userId;
  } else if (direction === "outgoing") {
    where.fromId = userId;
  } else {
    where.OR = [{ fromId: userId }, { toId: userId }];
  }

  const requests = await prisma.request.findMany({
    where,
  });

  res.json({ requests });
};

module.exports.acceptRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { requestId } = matchedData(req);

  const request = await prisma.request.delete({
    where: { id: requestId, toId: userId },
  });

  const { fromId, toId } = request;
  const lesserId = fromId < toId ? fromId : toId;
  const greaterId = fromId >= toId ? fromId : toId;
  await prisma.friendship.create({ data: { lesserId, greaterId } });

  res.json({ message: "success" });
};

module.exports.rejectRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { requestId } = matchedData(req);

  await prisma.request.delete({
    where: { id: requestId, toId: userId },
  });

  res.json({ message: "success" });
};

module.exports.deleteRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { requestId } = matchedData(req);

  await prisma.request.delete({
    where: { id: requestId, fromId: userId },
  });

  res.json({ message: "success" });
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
