const prisma = require("./prisma");

(async function main() {
  await prisma.group.deleteMany();
  await prisma.friendship.deleteMany();

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
    { lesserId: 1, greaterId: 2 },
    { lesserId: 1, greaterId: 3 },
    { lesserId: 2, greaterId: 3 },
    { lesserId: 3, greaterId: 4 },
    { lesserId: 3, greaterId: 5 },
  ];

  const messagesByChat = {
    "1-2": [
      { userId: 1, text: "Hi" },
      { userId: 2, text: "Hello there!" },
      { userId: 1, text: "Hey" },
      { userId: 2, text: "What's up?" },
      { userId: 1, text: "Not much, just chilling." },
      { userId: 2, text: "Cool." },
    ],
    "1-3": [{ userId: 1, text: "I love you bro..." }],
    "3-4": [
      { userId: 3, text: "We happy?" },
      { userId: 4, text: "Yeah, we happy." },
      {
        userId: 3,
        text: "Do you know what they call a Quarter Pounder with Cheese in Paris?",
      },
      {
        userId: 4,
        text: "They don't call it a Quarter Pounder with Cheese?",
      },
      {
        userId: 3,
        text: "No man, they got the metric system. They wouldn't know what a Quarter Pounder is.",
      },
      { userId: 4, text: "Then what do they call it?" },
      { userId: 3, text: "They call it a Royale with Cheese." },
      {
        userId: 4,
        text: "A Royale with cheese. What do they call a Big Mac?",
      },
      {
        userId: 3,
        text: "Well, a Big Mac's a Big Mac, but they call it le Big-Mac.",
      },
      {
        userId: 4,
        text: "Le Big-Mac. Haha. What do they call a Whopper?",
      },
      {
        userId: 3,
        text: "I dunno, I didn't go into Burger King.",
      },
      { userId: 4, text: "Vincent Vega, our man in Amsterdam!" },
      {
        userId: 3,
        text: "Jules Winnfield, our man in Inglewood.",
      },
    ],
    "3-5": [
      { userId: 5, text: "I want that trophy." },
      { userId: 3, text: "You'll get it." },
      {
        userId: 5,
        text: "Don't you just love it when you come back from the bathroom and find your food waiting for you?",
      },
      { userId: 3, text: "We're lucky we got anything at all." },
      {
        userId: 5,
        text: "I'm going to go to the bathroom and powder my nose.",
      },
      { userId: 5, text: "I want that dance." },
      { userId: 3, text: "I don't think so." },
    ],
  };

  for (const { lesserId: id1, greaterId: id2 } of friendships) {
    const key = `${id1}-${id2}`;
    const chatMessages = messagesByChat[key] || [];

    await prisma.friendship.create({
      data: {
        lesserId: id1,
        greaterId: id2,
        chat: { create: { messages: { create: chatMessages } } },
      },
    });
  }

  await prisma.group.create({
    data: {
      name: "Memes",
      avatarUrl:
        "https://i.pinimg.com/474x/7b/8c/c0/7b8cc0d2f68f3453b34924b06032d810.jpg",
      memberships: {
        create: [{ userId: 1 }, { userId: 3, role: "ADMIN" }, { userId: 5 }],
      },
      chat: {
        create: {
          messages: {
            create: [
              { userId: 1, text: "Did you guys see the new trailer?" },
              { userId: 1, text: "It looks absolutely insane." },
              { userId: 1, text: "I've watched it like five times already." },
              { userId: 1, text: "The cinematography is top notch." },
              {
                userId: 1,
                text: "We should definitely go see it on opening night.",
              },
              { userId: 3, text: "I'm down for that!" },
              { userId: 3, text: "The soundtrack also sounds promising." },
              { userId: 3, text: "I heard they filmed it in Iceland." },
              { userId: 3, text: "The lead actor is one of my favorites." },
              {
                userId: 3,
                text: "Let's book the tickets as soon as they're out.",
              },
              { userId: 5, text: "Count me in too." },
              { userId: 5, text: "I'll bring the popcorn." },
              { userId: 5, text: "Is it a sequel or a standalone movie?" },
              { userId: 5, text: "Either way, the hype is real." },
              { userId: 5, text: "Can't wait for next month." },
            ],
          },
        },
      },
    },
  });
})();
