const request = require("supertest");
const bcrypt = require("bcryptjs");
const {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} = require("@jest/globals");
const { store } = require("../middlewares/session");
const prisma = require("../lib/prisma");
const socketIo = require("../lib/socket-io");
const app = require("../app");
const { cleanupRelationships, getFriendshipKey } = require("./utils");

let users;
let friendships;
let requests;
let chats;

let agent;

beforeAll(async () => {
  jest.spyOn(socketIo, "notifyUser").mockImplementation(() => {});

  users = {
    main: {
      username: "main",
      password: "password123",
    },
    friendA: {
      username: "friendA",
      password: "password123",
    },
    friendB: {
      username: "friendB",
      password: "password123",
    },
    exFriend: {
      username: "exFriend",
      password: "password123",
    },
    newFriend: {
      username: "newFriend",
      password: "password123",
    },
    idol: {
      username: "idol",
      password: "password123",
    },
    stranger: {
      username: "stranger",
      password: "password123",
    },
  };

  for (const [key, user] of Object.entries(users)) {
    const { password, ...profile } = user;
    const hash = await bcrypt.hash(password, 10);

    const record = await prisma.user.upsert({
      where: { username: user.username },
      update: {
        ...profile,
        password: {
          upsert: {
            create: { hash },
            update: { hash },
          },
        },
      },
      create: {
        ...profile,
        password: {
          create: { hash },
        },
      },
    });

    users[key].id = record.id;
  }

  requests = [
    { senderId: users.main.id, receiverId: users.idol.id },
    { senderId: users.newFriend.id, receiverId: users.main.id },
    { senderId: users.exFriend.id, receiverId: users.main.id },
  ];

  friendships = [
    getFriendshipKey(users.main.id, users.friendA.id),
    getFriendshipKey(users.main.id, users.friendB.id),
    {
      ...getFriendshipKey(users.main.id, users.exFriend.id),
      endedAt: new Date(),
    },
  ];

  chats = [
    getFriendshipKey(users.main.id, users.friendA.id),
    getFriendshipKey(users.main.id, users.friendB.id),
    getFriendshipKey(users.main.id, users.exFriend.id),
  ];

  agent = request.agent(app);
  await agent
    .post("/login")
    .send({
      username: users.main.username,
      password: users.main.password,
    })
    .expect(200);
});

beforeEach(async () => {
  jest.clearAllMocks();

  const ids = Object.values(users).map((user) => user.id);
  await cleanupRelationships(ids);
  await prisma.request.createMany({ data: requests });
  await prisma.friendship.createMany({ data: friendships });
  await prisma.chat.createMany({ data: chats });
});

afterAll(async () => {
  jest.restoreAllMocks();

  const ids = Object.values(users)
    .map((user) => user.id)
    .filter(Boolean);
  await cleanupRelationships(ids);

  await prisma.user.deleteMany({
    where: {
      username: { in: Object.values(users).map((user) => user.username) },
    },
  });

  await store.shutdown();
});

describe("Testing friend routes", () => {
  describe("GET /friends", () => {
    test("should return 401 if not logged in", async () => {
      await request(app).get("/friends").expect(401);
    });

    test("should successfully return friends", async () => {
      const response = await agent.get("/friends").expect(200);

      expect(response.body.friendIds).toEqual(
        expect.arrayContaining([users.friendA.id, users.friendB.id]),
      );

      expect(response.body.friendIds).toEqual(
        expect.not.arrayContaining([
          users.exFriend.id,
          users.newFriend.id,
          users.stranger.id,
        ]),
      );
    });

    test("should return empty array if has no friends", async () => {
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            getFriendshipKey(users.main.id, users.friendA.id),
            getFriendshipKey(users.main.id, users.friendB.id),
          ],
        },
      });

      const response = await agent.get("/friends").expect(200);

      expect(response.body.friendIds).toEqual([]);
    });
  });

  describe("POST /friends/:friendId", () => {
    test("should return 401 if not logged in", async () => {
      await request(app).post(`/friends/${users.newFriend.id}`).expect(401);
    });

    test("should return 422 if friendId is not an integer", async () => {
      const response = await agent.post("/friends/not-an-id").expect(422);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "UNPROCESSABLE_ENTITY",
          code: 422,
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: "VALIDATION_ERROR",
              field: "friendId",
              location: "params",
            }),
          ]),
        }),
      );
    });

    test("should return 422 if trying to befriend oneself", async () => {
      const response = await agent
        .post(`/friends/${users.main.id}`)
        .expect(422);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "UNPROCESSABLE_ENTITY",
          code: 422,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "You cannot befriend yourself",
            }),
          ]),
        }),
      );
    });

    test("should return 404 if user does not exist", async () => {
      const response = await agent.post("/friends/99999999").expect(404);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "NOT_FOUND",
          code: 404,
        }),
      );
    });

    test("should return error if there is no request", async () => {
      const response = await agent
        .post(`/friends/${users.stranger.id}`)
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "CONFLICT",
          code: 409,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "You do not have a friend request from this user",
            }),
          ]),
        }),
      );
    });

    test("should return error if there is a sent request", async () => {
      const response = await agent
        .post(`/friends/${users.idol.id}`)
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "CONFLICT",
          code: 409,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "You do not have a friend request from this user",
            }),
          ]),
        }),
      );
    });

    test("should successfully add friend if there is a received request", async () => {
      const response = await agent
        .post(`/friends/${users.newFriend.id}`)
        .expect(200);

      expect(response.body).toEqual({ friendId: users.newFriend.id });

      const deletedRequest = await prisma.request.findUnique({
        where: {
          senderId_receiverId: {
            senderId: users.newFriend.id,
            receiverId: users.main.id,
          },
        },
      });
      expect(deletedRequest).toBeNull();

      const friendship = await prisma.friendship.findUnique({
        where: {
          friendAId_friendBId: getFriendshipKey(
            users.main.id,
            users.newFriend.id,
          ),
        },
        include: { chat: { include: { messages: true } } },
      });

      expect(friendship).not.toBeNull();
      expect(friendship.endedAt).toBeNull();
      expect(friendship.chat).not.toBeNull();
      expect(friendship.chat.messages).toEqual([
        expect.objectContaining({
          type: "OPEN",
          userId: users.main.id,
          metadata: {
            targetUserId: users.newFriend.id,
            isOldestMessage: true,
          },
        }),
      ]);

      expect(socketIo.notifyUser).toHaveBeenCalledWith(
        [users.main.id, users.newFriend.id],
        "remove_request",
        {
          request: {
            senderId: users.newFriend.id,
            receiverId: users.main.id,
          },
        },
      );
      expect(socketIo.notifyUser).toHaveBeenCalledWith(
        users.main.id,
        "add_friend",
        { friendId: users.newFriend.id },
      );
      expect(socketIo.notifyUser).toHaveBeenCalledWith(
        users.newFriend.id,
        "add_friend",
        { friendId: users.main.id },
      );
    });

    test("should successfully resume a friendship", async () => {
      const response = await agent
        .post(`/friends/${users.exFriend.id}`)
        .expect(200);

      expect(response.body).toEqual({ friendId: users.exFriend.id });

      const friendship = await prisma.friendship.findUnique({
        where: {
          friendAId_friendBId: getFriendshipKey(
            users.main.id,
            users.exFriend.id,
          ),
        },
      });

      expect(friendship).not.toBeNull();
      expect(friendship.endedAt).toBeNull();
    });
  });

  describe("DELETE /friends/:friendId", () => {
    test("should return 401 if not logged in", async () => {
      await request(app).delete(`/friends/${users.friendA.id}`).expect(401);
    });

    test("should return 422 if friendId is not an integer", async () => {
      const response = await agent.delete("/friends/not-an-id").expect(422);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "UNPROCESSABLE_ENTITY",
          code: 422,
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: "VALIDATION_ERROR",
              field: "friendId",
              location: "params",
            }),
          ]),
        }),
      );
    });

    test("should return 422 if trying to unfriend oneself", async () => {
      const response = await agent
        .delete(`/friends/${users.main.id}`)
        .expect(422);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "UNPROCESSABLE_ENTITY",
          code: 422,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "You cannot unfriend yourself",
            }),
          ]),
        }),
      );
    });

    test("should return 404 if user does not exist", async () => {
      const response = await agent.delete("/friends/99999999").expect(404);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "NOT_FOUND",
          code: 404,
        }),
      );
    });

    test("should return error if not friends", async () => {
      const response = await agent
        .delete(`/friends/${users.stranger.id}`)
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "CONFLICT",
          code: 409,
        }),
      );
    });

    test("should successfully end friendship otherwise", async () => {
      const response = await agent
        .delete(`/friends/${users.friendA.id}`)
        .expect(200);

      expect(response.body).toEqual({ success: true });

      const updatedFriendship = await prisma.friendship.findUnique({
        where: {
          friendAId_friendBId: getFriendshipKey(
            users.main.id,
            users.friendA.id,
          ),
        },
      });
      expect(updatedFriendship.endedAt).not.toBeNull();

      expect(socketIo.notifyUser).toHaveBeenCalledWith(
        users.main.id,
        "remove_friend",
        { friendId: users.friendA.id },
      );
      expect(socketIo.notifyUser).toHaveBeenCalledWith(
        users.friendA.id,
        "remove_friend",
        { friendId: users.main.id },
      );
    });
  });
});
