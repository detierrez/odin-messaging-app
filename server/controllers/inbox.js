const prisma = require("../lib/prisma");

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
