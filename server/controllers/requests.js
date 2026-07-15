const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const socketIo = require("../lib/socket-io");
const { toSorted } = require("../lib/utils");
const { HttpError } = require("../lib/errors");

module.exports.getRequests = async (req, res) => {
  const { id: userId } = req.user;

  const requests = await prisma.request.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    select: { senderId: true, receiverId: true },
  });

  res.json({ requests });
};

module.exports.postRequest = async (req, res) => {
  const { id: userId, username } = req.user;
  let { userId: otherUserId, username: otherUsername } = matchedData(req);

  if (userId === otherUserId || username === otherUsername) {
    throw new HttpError(422, "You cannot send a request to yourself.");
  }

  const senderId = userId;
  const receiverId = otherUserId
    ? (
        await prisma.user.findUnique({
          where: { id: otherUserId },
          select: { id: true },
        })
      )?.id
    : (
        await prisma.user.findUnique({
          where: { username: otherUsername },
          select: { id: true },
        })
      )?.id;

  if (!receiverId) {
    throw new HttpError(404, "User not found.");
  }

  const [friendAId, friendBId] = toSorted([senderId, receiverId]);
  const [friendship, sentRequest, receivedRequest] = await Promise.all([
    prisma.friendship.findUnique({
      where: { friendAId_friendBId: { friendAId, friendBId } },
      select: { endedAt: true },
    }),
    prisma.request.findUnique({
      where: {
        senderId_receiverId: { senderId, receiverId },
      },
    }),
    prisma.request.findUnique({
      where: {
        senderId_receiverId: { senderId: receiverId, receiverId: senderId },
      },
    }),
  ]);

  if (friendship && !friendship.endedAt) {
    throw new HttpError(409, "You are already friends.");
  }

  if (sentRequest) {
    throw new HttpError(409, "You already sent a request to this user");
  }

  if (receivedRequest) {
    throw new HttpError(
      409,
      "You already have a pending request from this user",
    );
  }

  const request = await prisma.request.create({
    data: { senderId, receiverId },
    select: { receiverId: true, senderId: true },
  });

  socketIo.notifyUser([senderId, receiverId], "add_request", { request });
  res.json({ success: true });
};

module.exports.deleteRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { otherUserId } = matchedData(req);

  const existingRequest = await prisma.request.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    select: { senderId: true, receiverId: true },
  });

  if (!existingRequest) throw new HttpError(404, "Request not found");

  const { senderId, receiverId } = existingRequest;
  const request = await prisma.request.delete({
    where: { senderId_receiverId: { senderId, receiverId } },
    select: { senderId: true, receiverId: true },
  });

  socketIo.notifyUser([userId, otherUserId], "remove_request", { request });
  res.json({ success: true });
};
