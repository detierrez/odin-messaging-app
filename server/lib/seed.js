const prisma = require("./prisma");

(async function main() {
  await prisma.chat.deleteMany();

  // await prisma.user.deleteMany();

  // await prisma.user.createMany({
  //   data: [
  //     { username: "pulp" },
  //     { username: "fiction" },
  //     { username: "vincent" },
  //     { username: "jules" },
  //     { username: "mia" },
  //   ],
  // });

  const friendships = [
    { userAId: 1, userBId: 2 },
    { userAId: 1, userBId: 3 },
    { userAId: 2, userBId: 3 },
    { userAId: 3, userBId: 4 },
    { userAId: 3, userBId: 5 },
  ];

  const messagesByChat = {
    "1-2": [
      { userId: 1, content: "Hi" },
      { userId: 2, content: "Hello there!" },
      { userId: 1, content: "Hey" },
      { userId: 2, content: "What's up?" },
      { userId: 1, content: "Not much, just chilling." },
      { userId: 2, content: "Cool." },
    ],
    "1-3": [{ userId: 1, content: "I love you bro..." }],
    "3-4": [
      { userId: 3, content: "We happy?" },
      { userId: 4, content: "Yeah, we happy." },
      {
        userId: 3,
        content:
          "Do you know what they call a Quarter Pounder with Cheese in Paris?",
      },
      {
        userId: 4,
        content: "They don't call it a Quarter Pounder with Cheese?",
      },
      {
        userId: 3,
        content:
          "No man, they got the metric system. They wouldn't know what a Quarter Pounder is.",
      },
      { userId: 4, content: "Then what do they call it?" },
      { userId: 3, content: "They call it a Royale with Cheese." },
      {
        userId: 4,
        content: "A Royale with cheese. What do they call a Big Mac?",
      },
      {
        userId: 3,
        content: "Well, a Big Mac's a Big Mac, but they call it le Big-Mac.",
      },
      {
        userId: 4,
        content: "Le Big-Mac. Haha. What do they call a Whopper?",
      },
      {
        userId: 3,
        content: "I dunno, I didn't go into Burger King.",
      },
      { userId: 4, content: "Vincent Vega, our man in Amsterdam!" },
      {
        userId: 3,
        content: "Jules Winnfield, our man in Inglewood.",
      },
    ],
    "3-5": [
      { userId: 5, content: "I want that trophy." },
      { userId: 3, content: "You'll get it." },
      {
        userId: 5,
        content:
          "Don't you just love it when you come back from the bathroom and find your food waiting for you?",
      },
      { userId: 3, content: "We're lucky we got anything at all." },
      {
        userId: 5,
        content: "I'm going to go to the bathroom and powder my nose.",
      },
      { userId: 5, content: "I want that dance." },
      { userId: 3, content: "I don't think so." },
    ],
  };

  for (const { userAId, userBId } of friendships) {
    const key = `${userAId}-${userBId}`;
    const chatMessages = messagesByChat[key] || [];

    await prisma.chat.create({
      data: {
        readAccesses: { create: [{ userId: userAId }, { userId: userBId }] },
        writeAccesses: { create: [{ userId: userAId }, { userId: userBId }] },
        messages: { create: chatMessages },
      },
    });
  }

  await prisma.chat.create({
    data: {
      type: "GROUP",
      name: "Memes",
      avatarUrl:
        "https://i.pinimg.com/474x/7b/8c/c0/7b8cc0d2f68f3453b34924b06032d810.jpg",
      writeAccesses: {
        create: [{ userId: 1 }, { userId: 3, role: "ADMIN" }, { userId: 5 }],
      },
      readAccesses: {
        create: [{ userId: 1 }, { userId: 3 }, { userId: 5 }],
      },
      messages: {
        create: [
          { userId: 1, content: "Did you guys see the new trailer?" },
          { userId: 1, content: "It looks absolutely insane." },
          { userId: 1, content: "I've watched it like five times already." },
          { userId: 1, content: "The cinematography is top notch." },
          {
            userId: 1,
            content: "We should definitely go see it on opening night.",
          },
          { userId: 3, content: "I'm down for that!" },
          { userId: 3, content: "The soundtrack also sounds promising." },
          { userId: 3, content: "I heard they filmed it in Iceland." },
          { userId: 3, content: "The lead actor is one of my favorites." },
          {
            userId: 3,
            content: "Let's book the tickets as soon as they're out.",
          },
          { userId: 5, content: "Count me in too." },
          { userId: 5, content: "I'll bring the popcorn." },
          { userId: 5, content: "Is it a sequel or a standalone movie?" },
          { userId: 5, content: "Either way, the hype is real." },
          { userId: 5, content: "Can't wait for next month." },
        ],
      },
    },
  });
})();
