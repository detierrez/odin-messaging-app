const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");
const { notifyRequest } = require("../socket.io");

module.exports.getRequests = async (req, res) => {
  const { id: userId } = req.user;

  const [sent, received] = await Promise.all([
    prisma.request.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
    }),
    prisma.request.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
    }),
  ]);

  const sentTo = sent.map(({ receiverId }) => receiverId);
  const receivedFrom = received.map(({ senderId }) => senderId);

  res.json({ requests: { sentTo, receivedFrom } });
};

module.exports.postRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { username } = matchedData(req);

  const otherUser = await prisma.user.findFirst({ where: { username } });
  if (!otherUser) throw new httpError(400, [{ reason: "User does not exist" }]);

  const otherUserId = otherUser.id;
  if (userId === otherUserId) {
    throw new httpError(400, [{ reason: "Cannot send a request to yourself" }]);
  }

  const [existingDirect, existingRequest] = await Promise.all([
    prisma.chat.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          { writeAccesses: { some: { userId, endedAt: null } } },
          { writeAccesses: { some: { userId: otherUserId, endedAt: null } } },
        ],
      },
      select: { id: true },
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

  if (existingDirect) {
    throw new httpError(400, [{ reason: "You are already friends" }]);
  }
  if (existingRequest) {
    throw new httpError(400, [
      { reason: "A request already exists between these users" },
    ]);
  }

  await prisma.request.create({
    data: { senderId: userId, receiverId: otherUserId },
  });

  notifyRequest("add_request", userId, otherUserId);
  res.json({ success: true });
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
    select: { senderId: true, receiverId: true },
  });

  if (!request) throw new httpError(404, [{ reason: "Request not found" }]);

  const { senderId, receiverId } = request;
  await prisma.request.delete({
    where: { senderId_receiverId: { senderId, receiverId } },
  });

  notifyRequest("remove_request", senderId, receiverId);
  res.json({ success: true });
};
