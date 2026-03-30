const prisma = require("./prisma");

(async function main() {
  await prisma.message.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.chat.deleteMany();
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
  await prisma.friendship.createMany({ data: friendships });

  const messagesByChat = {
    "1-2": [
      { fromId: 1, text: "Hi" },
      { fromId: 2, text: "Hello there!" },
      { fromId: 1, text: "Hey" },
      { fromId: 2, text: "What's up?" },
      { fromId: 1, text: "Not much, just chilling." },
      { fromId: 2, text: "Cool." },
    ],
    "1-3": [{ fromId: 1, text: "I love you bro..." }],
    "3-4": [
      { fromId: 3, text: "We happy?" },
      { fromId: 4, text: "Yeah, we happy." },
      {
        fromId: 3,
        text: "Do you know what they call a Quarter Pounder with Cheese in Paris?",
      },
      {
        fromId: 4,
        text: "They don't call it a Quarter Pounder with Cheese?",
      },
      {
        fromId: 3,
        text: "No man, they got the metric system. They wouldn't know what a Quarter Pounder is.",
      },
      { fromId: 4, text: "Then what do they call it?" },
      { fromId: 3, text: "They call it a Royale with Cheese." },
      {
        fromId: 4,
        text: "A Royale with cheese. What do they call a Big Mac?",
      },
      {
        fromId: 3,
        text: "Well, a Big Mac's a Big Mac, but they call it le Big-Mac.",
      },
      {
        fromId: 4,
        text: "Le Big-Mac. Haha. What do they call a Whopper?",
      },
      {
        fromId: 3,
        text: "I dunno, I didn't go into Burger King.",
      },
      { fromId: 4, text: "Vincent Vega, our man in Amsterdam!" },
      {
        fromId: 3,
        text: "Jules Winnfield, our man in Inglewood.",
      },
    ],
    "3-5": [
      { fromId: 5, text: "I want that trophy." },
      { fromId: 3, text: "You'll get it." },
      {
        fromId: 5,
        text: "Don't you just love it when you come back from the bathroom and find your food waiting for you?",
      },
      { fromId: 3, text: "We're lucky we got anything at all." },
      {
        fromId: 5,
        text: "I'm going to go to the bathroom and powder my nose.",
      },
      { fromId: 5, text: "I want that dance." },
      { fromId: 3, text: "I don't think so." },
    ],
  };

  for (const { lesserId: id1, greaterId: id2 } of friendships) {
    const key = `${id1}-${id2}`;
    const chatMessages = messagesByChat[key] || [];

    await prisma.chat.create({
      data: {
        type: "DIRECT",
        participations: { create: [{ userId: id1 }, { userId: id2 }] },
        messages: {
          create: chatMessages,
        },
      },
    });
  }

  await prisma.chat.create({
    data: {
      type: "GROUP",
      name: "Memes",
      avatarUrl:
        "https://i.pinimg.com/474x/7b/8c/c0/7b8cc0d2f68f3453b34924b06032d810.jpg",
      participations: { create: [{ userId: 1 }, { userId: 3 }, { userId: 5 }] },
      messages: {
        create: [
          { fromId: 1, text: "Did you guys see the new trailer?" },
          { fromId: 1, text: "It looks absolutely insane." },
          { fromId: 1, text: "I've watched it like five times already." },
          { fromId: 1, text: "The cinematography is top notch." },
          {
            fromId: 1,
            text: "We should definitely go see it on opening night.",
          },
          { fromId: 3, text: "I'm down for that!" },
          { fromId: 3, text: "The soundtrack also sounds promising." },
          { fromId: 3, text: "I heard they filmed it in Iceland." },
          { fromId: 3, text: "The lead actor is one of my favorites." },
          { fromId: 3, text: "Let's book the tickets as soon as they're out." },
          { fromId: 5, text: "Count me in too." },
          { fromId: 5, text: "I'll bring the popcorn." },
          { fromId: 5, text: "Is it a sequel or a standalone movie?" },
          { fromId: 5, text: "Either way, the hype is real." },
          { fromId: 5, text: "Can't wait for next month." },
        ],
      },
    },
  });
})();
