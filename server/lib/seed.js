const prisma = require("./prisma");

(async function main() {
  await prisma.chat.deleteMany();
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: 1,
        username: "pulp",
        alias: "Purp is blurp",
        description: "Ipsum lorem",
        avatarUrl:
          "https://res.cloudinary.com/dg8iatkag/image/upload/v1772991601/samples/shoe.jpg",
      },
      {
        id: 2,
        username: "fiction",
      },
      {
        id: 3,
        username: "vincent",
        alias: "Zen",
        avatarUrl:
          "https://res.cloudinary.com/dg8iatkag/image/upload/v1781901972/odinbox/fgp4nrwfmv1y7n1arjdo.jpg",
      },
      {
        id: 4,
        username: "jules",
        avatarUrl: "https://cdn-icons-png.flaticon.com/256/11112/11112578.png",
      },
      {
        id: 5,
        username: "mia",
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdylxLhRufslAQAarJ-Hwy_8b3gmBuIk8PAQ&s",
      },
      {
        id: 6,
        username: "allen",
        avatarUrl:
          "https://pbs.twimg.com/profile_images/378800000154826980/fc64e8495f56253ca7402a06f895f85a_400x400.jpeg",
      },
    ],
  });

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
        messages: {
          create: [
            {
              type: "OPEN",
              userId: userAId,
              metadata: { targetUserId: userBId },
            },
            ...chatMessages,
          ],
        },
      },
    });
  }

  await prisma.request.createMany({
    data: [
      { senderId: 3, receiverId: 6 },
      { senderId: 6, receiverId: 5 },
    ],
  });

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
          { type: "OPEN", userId: 3 },
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
          { userId: 1, content: "We should set up a group chat reminder." },
          { userId: 3, content: "I can organize the tickets." },
          { userId: 1, content: "Let me know when the pre-sale starts." },
          { userId: 5, content: "I hope they do a midnight showing." },
          { userId: 3, content: "A midnight showing would be epic." },
          { userId: 1, content: "Do you think there will be merch?" },
          { userId: 5, content: "If there is, I'm buying the poster." },
          {
            userId: 3,
            content: "I love the soundtrack even without seeing the movie.",
          },
          {
            userId: 1,
            content: "The visual effects in the trailer were insane.",
          },
          { userId: 5, content: "I wonder if the director will do a Q&A." },
          { userId: 3, content: "That would be awesome. I would go for sure." },
          { userId: 1, content: "Maybe we can grab dinner before the show." },
          { userId: 5, content: "Yes, let's do tacos. Or burgers." },
          { userId: 3, content: "Tacos sound perfect. I know a great place." },
          { userId: 1, content: "I'll check the schedule and send it here." },
          { userId: 5, content: "Thanks! Can't wait to see it with you guys." },
          {
            userId: 1,
            content: "I'll create a calendar invite for the group.",
          },
          {
            userId: 3,
            content: "Don't forget to include the restaurant address.",
          },
          {
            userId: 5,
            content: "I'm already getting hungry thinking about those tacos.",
          },
          {
            userId: 1,
            content: "Should we invite anyone else from the office?",
          },
          {
            userId: 3,
            content: "Maybe just keep it to our small group for now.",
          },
          {
            userId: 5,
            content: "Agreed, easier to coordinate seating that way.",
          },
          { userId: 1, content: "True, IMAX theaters fill up so fast." },
          { userId: 3, content: "I'll try to get the center row seats." },
          { userId: 5, content: "You're the MVP if you manage that." },
          { userId: 1, content: "Has anyone read the book it's based on?" },
          { userId: 3, content: "I didn't even know there was a book!" },
          { userId: 5, content: "I read it last summer, the ending is wild." },
          { userId: 1, content: "No spoilers please! I want to be surprised." },
          { userId: 5, content: "My lips are sealed. 🤐" },
          {
            userId: 3,
            content: "I'm going to avoid all reviews until we see it.",
          },
          { userId: 1, content: "That's the best way to experience it." },
          {
            userId: 5,
            content:
              "I'm going to re-watch the director's previous film tonight.",
          },
          { userId: 3, content: "The one about the time travelers?" },
          { userId: 5, content: "Yeah, that one is a masterpiece." },
          {
            userId: 1,
            content: "Okay, I'm officially hyped. See you guys then!",
          },
        ],
      },
    },
  });
})();
