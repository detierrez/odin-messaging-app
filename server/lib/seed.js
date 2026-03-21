const prisma = require("./prisma");

(async function main() {
  await prisma.message.deleteMany();
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
  await prisma.message.createMany({
    data: [
      { fromId: 1, toId: 2, text: "Hi" },
      { fromId: 2, toId: 1, text: "Hello there!" },
      { fromId: 3, toId: 4, text: "We happy?" },
      { fromId: 4, toId: 3, text: "Yeah, we happy." },
      { fromId: 5, toId: 3, text: "I want that trophy." },
      { fromId: 3, toId: 5, text: "You'll get it." },
      {
        fromId: 3,
        toId: 4,
        text: "Do you know what they call a Quarter Pounder with Cheese in Paris?",
      },
      {
        fromId: 4,
        toId: 3,
        text: "They don't call it a Quarter Pounder with Cheese?",
      },
      {
        fromId: 3,
        toId: 4,
        text: "No man, they got the metric system. They wouldn't know what a Quarter Pounder is.",
      },
      { fromId: 4, toId: 3, text: "Then what do they call it?" },
      { fromId: 3, toId: 4, text: "They call it a Royale with Cheese." },
      {
        fromId: 4,
        toId: 3,
        text: "A Royale with cheese. What do they call a Big Mac?",
      },
      {
        fromId: 3,
        toId: 4,
        text: "Well, a Big Mac's a Big Mac, but they call it le Big-Mac.",
      },
      {
        fromId: 4,
        toId: 3,
        text: "Le Big-Mac. Haha. What do they call a Whopper?",
      },
      { fromId: 3, toId: 4, text: "I dunno, I didn't go into Burger King." },
      {
        fromId: 5,
        toId: 3,
        text: "Don't you just love it when you come back from the bathroom and find your food waiting for you?",
      },
      { fromId: 3, toId: 5, text: "We're lucky we got anything at all." },
      {
        fromId: 5,
        toId: 3,
        text: "I'm going to go to the bathroom and powder my nose.",
      },
      { fromId: 1, toId: 2, text: "Hey" },
      { fromId: 2, toId: 1, text: "What's up?" },
      { fromId: 1, toId: 2, text: "Not much, just chilling." },
      { fromId: 2, toId: 1, text: "Cool." },
      { fromId: 4, toId: 3, text: "Vincent Vega, our man in Amsterdam!" },
      { fromId: 3, toId: 4, text: "Jules Winnfield, our man in Inglewood." },
      { fromId: 5, toId: 3, text: "I want that dance." },
      { fromId: 3, toId: 5, text: "I don't think so." },
      { fromId: 1, toId: 3, text: "I love you bro..." },
    ],
  });
})();
