const prisma = require("./prisma");

(async function main() {
  await prisma.user.createMany({
    data: [
      { username: "pulp" },
      { username: "fiction" },
      { username: "vincent" },
      { username: "jules" },
      { username: "mia" },
    ],
  });
  await prisma.message.createMany({
    data: [
      { fromId: 1, toId: 2, text: "Hi" },
      { fromId: 2, toId: 1, text: "Hello there!" },
      { fromId: 3, toId: 4, text: "We happy?" },
      { fromId: 4, toId: 3, text: "Yeah, we happy." },
      { fromId: 5, toId: 3, text: "I want that trophy." },
      { fromId: 3, toId: 5, text: "You'll get it." },
    ],
  });
})();
