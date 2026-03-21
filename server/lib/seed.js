const prisma = require("./prisma");

(async function main() {
  await prisma.rock.createMany({
    data: [
      { size: 1 },
      { size: 2 },
      { size: 3 },
      { size: 4 },
      { size: 2 },
      { size: 3 },
      { size: 4 },
    ],
  });
})();
