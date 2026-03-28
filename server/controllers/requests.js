const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");

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
