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

  const io = req.app.get("io");
  io.to(`${lesserId}`).emit("friends_mutation", {
    action: "remove",
    friendId: greaterId,
  });
  io.to(`${greaterId}`).emit("friends_mutation", {
    action: "remove",
    friendId: lesserId,
  });

  res.json({ message: "success" });
};

module.exports.postRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { username } = req.body;

  let toId;
  try {
    const user = await prisma.user.findFirstOrThrow({ where: { username } });
    toId = user.id;
  } catch (error) {
    throw new httpError(400, [{ reason: "User does not exist" }]);
  }

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

    sendWebsocketRequestEvent(req, "add", request);
    res.json({ message: "success" });
  } catch (error) {
    if (error.code === "P2002") {
      throw new httpError(400, [{ reason: "A request already exists" }]);
    }
    throw error;
  }
};

module.exports.getRequests = async (req, res) => {
  const { id: userId } = req.user;

  const [sent, received] = await Promise.all([
    prisma.request.findMany({ where: { fromId: userId } }),
    prisma.request.findMany({ where: { toId: userId } }),
  ]);

  res.json({ requests: { sent, received } });
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
  const { lesserIdUser, greaterIdUser } = await prisma.friendship.create({
    data: { lesserId, greaterId },
    include: { lesserIdUser: true, greaterIdUser: true },
  });

  const io = req.app.get("io");
  io.to(`${lesserId}`).emit("friends_mutation", {
    action: "add",
    friend: greaterIdUser,
  });
  io.to(`${greaterId}`).emit("friends_mutation", {
    action: "add",
    friend: lesserIdUser,
  });
  sendWebsocketRequestEvent(req, "accept", request);
  res.json({ message: "success" });
};

module.exports.rejectRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { requestId } = matchedData(req);

  const request = await prisma.request.delete({
    where: { id: requestId, toId: userId },
  });

  sendWebsocketRequestEvent(req, "cancel", request);
  res.json({ message: "success" });
};

module.exports.deleteRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { requestId } = matchedData(req);

  const request = await prisma.request.delete({
    where: { id: requestId, fromId: userId },
  });

  sendWebsocketRequestEvent(req, "cancel", request);
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

module.exports.getInbox = async (req, res) => {
  const { id: userId } = req.user;

  const inbox = await prisma.$queryRaw`
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

  res.json({ inbox });
};

function sendWebsocketRequestEvent(req, action, friendRequest) {
  const io = req.app.get("io");
  io.to(`${friendRequest.fromId}`).emit("request_mutation", {
    action,
    direction: "sent",
    request: friendRequest,
  });
  io.to(`${friendRequest.toId}`).emit("request_mutation", {
    action,
    direction: "received",
    request: friendRequest,
  });
}
