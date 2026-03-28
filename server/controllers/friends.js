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
