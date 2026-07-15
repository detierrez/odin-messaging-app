const { createServer } = require("node:http");
const { Server } = require("socket.io");
const prisma = require("./prisma");
const m = require("../middlewares");

function onlyForHandshake(middleware) {
  return (req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      // Node.js 22 removed the internal _header property and _implicitHeader()
      // method that express-session relies on. Shim them back for compatibility.
      if (typeof res._implicitHeader !== "function") {
        res._implicitHeader = function () {
          if (!this.headersSent) this.writeHead(this.statusCode);
        };
      }
      if (!("_header" in res)) {
        Object.defineProperty(res, "_header", {
          get() {
            return this.headersSent ? true : null;
          },
          configurable: true,
        });
      }
      middleware(req, res, next);
    } else {
      next();
    }
  };
}

let io = null;

const initializeIo = (app, options) => {
  const server = createServer(app);
  io = new Server(server, options);

  io.engine.use(onlyForHandshake(m.session));
  io.engine.use(onlyForHandshake(m.passport.session));
  io.engine.use(
    onlyForHandshake((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.writeHead(401);
        res.end();
      }
    }),
  );

  io.on("connection", async (socket) => {
    const userId = socket.request.user.id;
    const participations = await prisma.participation.findMany({
      where: { userId, endedAt: null },
      select: { groupId: true },
    });

    socket.join(`user-${userId}`);
    participations.forEach(({ groupId }) => socket.join(`group-${groupId}`));

    console.log(
      `user ${userId} joined rooms: ${Array.from(socket.rooms.values()).join(", ")}`,
    );
    socket.on("disconnect", () => {
      console.log(`user ${userId} disconnected`);
    });
  });

  return server;
};

function notifyUser(userIds, action, payload) {
  io.to(getUserRoomIds(userIds)).emit(action, payload);
}

function addToGroupRoom(userIds, groupId) {
  io.in(getUserRoomIds(userIds)).socketsJoin(`group-${groupId}`);
}

function removeFromGroupRoom(userId, groupId) {
  io.in(`user-${userId}`).socketsLeave(`group-${groupId}`);
}

function closeGroupRoom(groupId) {
  io.in(`group-${groupId}`).socketsLeave(`group-${groupId}`);
}

function notifyGroup(groupId, action, payload) {
  io.to(`group-${groupId}`).emit(action, payload);
}

function getUserRoomIds(userIds) {
  userIds = Array.isArray(userIds) ? userIds : [userIds];
  return userIds.map((id) => `user-${id}`);
}

module.exports = {
  initializeIo,
  notifyUser,
  addToGroupRoom,
  removeFromGroupRoom,
  closeGroupRoom,
  notifyGroup,
};
