const { matchedData } = require("express-validator/lib");
const prisma = require("../lib/prisma");

module.exports.getMessagesByContact = async (req, res) => {
  const { id: userId } = req.user;
  const { contactId } = matchedData(req);

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromId: userId, toId: contactId },
        { fromId: contactId, toId: userId },
      ],
    },
    orderBy: { id: "desc" }, // TODO by date instead
  });
  console.log(messages);

  res.json(messages);
};

module.exports.postMessageToContact = async (req, res) => {
  const { id } = req.user;
  const { contactId } = matchedData(req);
  const { text } = req.body;

  const message = await prisma.message.create({
    data: { fromId: id, toId: contactId, text },
  });
  res.json(message);
};

module.exports.getInbox = async (req, res) => {
  const { id: userId } = req.user;

  const result = await prisma.$queryRaw`
    SELECT "id", "fromId", "toId", "text" FROM (
      SELECT DISTINCT ON ("contactId") *
      FROM (
        SELECT *, CASE WHEN "fromId" = ${userId} THEN "toId" ELSE "fromId" END AS "contactId"
        FROM "Message"
        WHERE "fromId" = ${userId} OR "toId" = ${userId}
      ) AS "messagesWithContact"
      ORDER BY "contactId", "id" DESC
    ) AS "distinctMessages"
    ORDER BY "id" DESC
  `;

  res.json(result);
};
