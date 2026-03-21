const prisma = require("../lib/prisma");

module.exports.getMessages = async (req, res) => {
  const messages = await prisma.message.findMany();
  res.json(messages);
};

module.exports.postMessage = async (req, res) => {
  try {
    const { fromId, toId, text } = req.body;
    const message = await prisma.message.create({
      data: { fromId, toId, text },
    });
    res.json(message);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
