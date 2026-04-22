const { Server } = require("socket.io");
const prisma = require("../lib/prisma");

let io = null;

const initializeIo = (server, options) => {
  io = new Server(server, options);

  io.use((socket, next) => {
    const userId =
      socket.handshake.auth.token || socket.handshake.headers?.token;
    if (!userId) return next(new Error("Unauthorized"));

    socket.userId = Number(userId);
    return next();
  });

  io.on("connection", async (socket) => {
    const { userId } = socket;
    const chats = await prisma.chat.findMany({
      where: {
        readAccesses: { some: { userId } },
        writeAccesses: { some: { userId, endedAt: null } },
      },
      select: { id: true },
    });

    socket.join(`user-${userId}`);
    chats.forEach(({ id }) => socket.join(`chat-${id}`));

    const rooms = Array.from(socket.rooms.values()).join(", ");
    console.log(`user ${userId} connected and joined: ${rooms}`);
    socket.on("disconnect", () => {
      console.log(`user ${userId} disconnected`);
    });
  });
};

function addToChatRoom(userId, chatId) {
  io.in(`user-${userId}`).socketsJoin(`chat-${chatId}`);
}

function removeFromChatRoom(userId, chatId) {
  io.in(`user-${userId}`).socketsLeave(`chat-${chatId}`);
}

function notifyChat(action, chatId, payload) {
  io.to(`chat-${chatId}`).emit(action, payload);
}

function notifyUser(action, userId, payload) {
  io.to(`user-${userId}`).emit(action, payload);
}

function notifyUsers(action, userIds, payload) {
  if (Array.isArray(userIds)) {
    for (const userId of userIds) {
      notifyUser(action, userId, payload);
    }
  } else {
    const payloadsByUser = userIds;
    for (const [id, payload] of Object.entries(payloadsByUser)) {
      notifyUser(action, Number(id), payload);
    }
  }
}

function notifyRequest(action, senderId, receiverId) {
  notifyUsers(action, {
    [senderId]: { receiverId },
    [receiverId]: { senderId },
  });
}

module.exports = {
  initializeIo,
  addToChatRoom,
  removeFromChatRoom,
  notifyUser,
  notifyUsers,
  notifyRequest,
  notifyChat,
};
