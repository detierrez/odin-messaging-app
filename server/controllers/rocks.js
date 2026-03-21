const prisma = require("../lib/prisma");

module.exports.getRocks = async (req, res) => {
  const rocks = await prisma.rock.findMany();
  res.json(rocks);
};
