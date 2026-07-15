const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const socketIo = require("../lib/socket-io");
const { toSorted } = require("../lib/utils");
const { HttpError } = require("../lib/errors");
const apiSelectors = require("./api-selectors");

module.exports.getFriends = async (req, res) => {
  const ownId = req.user.id;

  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ friendAId: ownId }, { friendBId: ownId }], endedAt: null },
    select: apiSelectors.friendship,
  });

  const friendIds = friendships.map(({ friendAId, friendBId }) =>
    ownId === friendAId ? friendBId : friendAId,
  );

  res.json({ friendIds });
};

module.exports.postFriend = async (req, res) => {
  const { id: userId } = req.user;
  const { friendId } = matchedData(req);

  if (userId === friendId) {
    throw new HttpError(422, "You cannot befriend yourself");
  }

  const { request, friendship, message } = await prisma.$transaction(
    async (tx) => {
      let request;
      try {
        request = await tx.request.delete({
          where: {
            senderId_receiverId: { senderId: friendId, receiverId: userId },
          },
        });
      } catch (error) {
        throw error.code === "P2025"
          ? new HttpError(
              409,
              "You do not have a friend request from this user",
            )
          : error;
      }

      const [friendAId, friendBId] = toSorted([userId, friendId]);

      const { chat, ...friendship } = await tx.friendship.upsert({
        where: { friendAId_friendBId: { friendAId, friendBId } },
        update: {
          endedAt: null,
          chat: {
            update: {
              messages: {
                create: {
                  type: "OPEN",
                  userId,
                  metadata: { targetUserId: friendId },
                },
              },
            },
          },
        },
        create: {
          friendAId,
          friendBId,
          chat: {
            create: {
              messages: {
                create: {
                  type: "OPEN",
                  userId,
                  metadata: { targetUserId: friendId, isOldestMessage: true },
                },
              },
            },
          },
        },
        select: {
          friendAId: true,
          friendBId: true,
          chat: {
            select: {
              messages: {
                select: apiSelectors.message,
                orderBy: { id: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      friendship.chatId = chat.id;
      const message = chat.messages[0];

      return { request, friendship, message };
    },
  );

  socketIo.notifyUser([userId, friendId], "remove_request", { request });
  socketIo.notifyUser(userId, "add_friend", { friendId });
  socketIo.notifyUser(friendId, "add_friend", { friendId: userdId });
  socketIo.notifyUser([userId, friendId], "add_message", { message });

  res.json({ friendship });
};

module.exports.deleteFriend = async (req, res) => {
  const { id: userId } = req.user;
  const { friendId } = matchedData(req);

  if (userId === friendId) {
    throw new HttpError(422, "You cannot unfriend yourself");
  }

  const { friendship, message } = await prisma.$transaction(async (tx) => {
    const [friendAId, friendBId] = toSorted([userId, friendId]);
    const friendship = await tx.friendship.update({
      where: { friendAId_friendBId: { friendAId, friendBId }, endedAt: null },
      data: { endedAt: new Date() },
      select: apiSelectors.friendship,
    });
    const message = await tx.message.create({
      data: {
        friendAId,
        friendBId,
        type: "CLOSE",
        userId,
        metadata: { targetUserId: friendId },
      },
      select: apiSelectors.message,
    });

    return { friendship, message };
  });

  socketIo.notifyUser(userId, "remove_friend", { friendId });
  socketIo.notifyUser(friendId, "remove_friend", { friendId: userdId });
  socketIo.notifyUser([userId, friendId], "add_message", { message });

  res.json({ success: true });
};
