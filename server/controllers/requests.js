const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");
const { toSorted } = require("../lib/common");

module.exports.postRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { username } = req.body;

  let otherUserId;
  try {
    const otherUser = await prisma.user.findFirstOrThrow({
      where: { username },
    });
    otherUserId = otherUser.id;
  } catch (error) {
    throw new httpError(400, [{ reason: "User does not exist" }]);
  }

  if (userId === otherUserId) {
    throw new httpError(400, [{ reason: "Cannot send a request to yourself" }]);
  }

  const [lesserId, greaterId] = toSorted([userId, otherUserId]);
  const [existingFriendship, existingRequest] = await Promise.all([
    prisma.friendship.findUnique({
      where: { lesserId_greaterId: { lesserId, greaterId } },
    }),
    prisma.request.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
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
      data: { senderId: userId, receiverId: otherUserId },
      include: { sender: true, receiver: true },
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
    prisma.request.findMany({
      where: { senderId: userId },
      select: { receiver: true },
    }),
    prisma.request.findMany({
      where: { receiverId: userId },
      select: { sender: true },
    }),
  ]);

  const sentTo = sent.map(({ receiver }) => receiver);
  const receivedFrom = received.map(({ sender }) => sender);

  res.json({ requests: { sentTo, receivedFrom } });
};

module.exports.deleteRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { otherUserId } = matchedData(req);

  const request = await prisma.request.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    include: { sender: true, receiver: true },
  });

  if (!request) {
    throw new httpError(404, [{ reason: "Request not found" }]);
  }

  await prisma.request.delete({
    where: {
      senderId_receiverId: {
        senderId: request.senderId,
        receiverId: request.receiverId,
      },
    },
  });

  sendWebsocketRequestEvent(req, "remove", request);
  res.json({ message: "success" });
};

module.exports.acceptRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { otherUserId } = matchedData(req);

  const { request, friendship } = await prisma.$transaction(async (tx) => {
    const deletedRequest = await tx.request.delete({
      where: {
        senderId_receiverId: { senderId: otherUserId, receiverId: userId },
      },
      include: { sender: true, receiver: true },
    });

    const [lesserId, greaterId] = toSorted([userId, otherUserId]);
    const newFriendship = await tx.friendship.create({
      data: { lesserId, greaterId },
      include: { lesserIdUser: true, greaterIdUser: true },
    });

    return { request: deletedRequest, friendship: newFriendship };
  });

  const { lesserIdUser, greaterIdUser } = friendship;
  const io = req.app.get("io");
  io.to(`${lesserIdUser.id}`).emit("friends_mutation", {
    action: "add",
    friend: greaterIdUser,
  });
  io.to(`${greaterIdUser.id}`).emit("friends_mutation", {
    action: "add",
    friend: lesserIdUser,
  });

  sendWebsocketRequestEvent(req, "remove", request);
  res.json({ message: "success" });
};

function sendWebsocketRequestEvent(req, action, request) {
  const { sender, receiver } = request;
  const io = req.app.get("io");

  io.to(`${sender.id}`).emit("request_mutation", {
    action,
    listName: "sentTo",
    otherUser: receiver,
  });
  io.to(`${receiver.id}`).emit("request_mutation", {
    action,
    listName: "receivedFrom",
    otherUser: sender,
  });
}
