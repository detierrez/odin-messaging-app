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
const { toSorted } = require("../lib/utils");
const app = require("../app");

const users = {
  main: {
    username: "reqmain",
    password: "password123",
  },
  friend: {
    username: "reqfriend",
    password: "password123",
  },
  idol: {
    username: "reqidol",
    password: "password123",
  },
  fan: {
    username: "reqfan",
    password: "password123",
  },
  stranger: {
    username: "reqstranger",
    password: "password123",
  },
};

let agent;

const cleanupRelationships = async (userIds) => {
  await prisma.request.deleteMany({
    where: {
      OR: [{ senderId: { in: userIds } }, { receiverId: { in: userIds } }],
    },
  });
  await prisma.friendship.deleteMany({
    where: {
      OR: [{ friendAId: { in: userIds } }, { friendBId: { in: userIds } }],
    },
  });
};

beforeAll(async () => {
  jest.spyOn(socketIo, "notifyUser").mockImplementation(() => {});

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

  const userIds = Object.values(users).map((u) => u.id);
  await cleanupRelationships(userIds);

  const [friendAId, friendBId] = toSorted([users.main.id, users.friend.id]);
  await prisma.friendship.create({
    data: { friendAId, friendBId, endedAt: null },
  });

  await prisma.request.createMany({
    data: [
      { senderId: users.main.id, receiverId: users.idol.id },
      { senderId: users.fan.id, receiverId: users.main.id },
    ],
  });
});

afterAll(async () => {
  jest.restoreAllMocks();

  const userIds = Object.values(users)
    .map((u) => u.id)
    .filter(Boolean);
  await cleanupRelationships(userIds);

  await prisma.user.deleteMany({
    where: {
      username: { in: Object.values(users).map((user) => user.username) },
    },
  });

  await store.shutdown();
});

describe("Testing requests", () => {
  describe("GET /requests", () => {
    test("should return 401 if not logged in", async () => {
      const res = await request(app).get("/requests").expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNAUTHORIZED",
          code: 401,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "Unauthenticated.",
              type: "UNAUTHENTICATED",
            }),
          ]),
        }),
      );
    });

    test("should get user's requests if logged in", async () => {
      const res = await agent.get("/requests").expect(200);

      expect(res.body.requests).toHaveLength(2);
      expect(res.body.requests).toEqual(
        expect.arrayContaining([
          { senderId: users.main.id, receiverId: users.idol.id },
          { senderId: users.fan.id, receiverId: users.main.id },
        ]),
      );
    });

    test("should only return requests involving the logged-in user", async () => {
      await prisma.request.create({
        data: { senderId: users.idol.id, receiverId: users.stranger.id },
      });

      const res = await agent.get("/requests").expect(200);

      expect(res.body.requests).toHaveLength(2);
      expect(res.body.requests).not.toEqual(
        expect.arrayContaining([
          { senderId: users.idol.id, receiverId: users.stranger.id },
        ]),
      );
    });

    test("should return an empty array if the user has no requests", async () => {
      await prisma.request.deleteMany({
        where: {
          OR: [{ senderId: users.main.id }, { receiverId: users.main.id }],
        },
      });

      const res = await agent.get("/requests").expect(200);

      expect(res.body).toEqual({ requests: [] });
    });
  });

  describe("POST /requests", () => {
    test("should return 401 if not logged in", async () => {
      const res = await request(app)
        .post("/requests")
        .send({ userId: users.stranger.id })
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNAUTHORIZED",
          code: 401,
        }),
      );
    });

    describe("User is logged in", () => {
      test("should return 422 if neither userId nor username is provided", async () => {
        const res = await agent.post("/requests").send({}).expect(422);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "UNPROCESSABLE_ENTITY",
            code: 422,
            errors: expect.arrayContaining([
              expect.objectContaining({
                type: "VALIDATION_ERROR",
                message: "Either username or userId must be provided",
              }),
            ]),
          }),
        );
      });

      test("should return 422 if userId is not a positive integer", async () => {
        const res = await agent
          .post("/requests")
          .send({ userId: -5 })
          .expect(422);

        expect(res.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "VALIDATION_ERROR",
              field: "userId",
              message: "userId must be a positive integer",
            }),
          ]),
        );
      });

      test("should return 422 if username has an invalid format", async () => {
        const res = await agent
          .post("/requests")
          .send({ username: "123invalid" })
          .expect(422);

        expect(res.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "VALIDATION_ERROR",
              field: "username",
              message: "username must start with a letter",
            }),
          ]),
        );
      });

      test("should return 422 if sent to oneself by userId", async () => {
        const res = await agent
          .post("/requests")
          .send({ userId: users.main.id })
          .expect(422);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "UNPROCESSABLE_ENTITY",
            code: 422,
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: "You cannot send a request to yourself.",
              }),
            ]),
          }),
        );
      });

      test("should return 422 if sent to oneself by username", async () => {
        const res = await agent
          .post("/requests")
          .send({ username: users.main.username })
          .expect(422);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "UNPROCESSABLE_ENTITY",
            code: 422,
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: "You cannot send a request to yourself.",
              }),
            ]),
          }),
        );
      });

      test("should return 404 if user does not exist by userId", async () => {
        const res = await agent
          .post("/requests")
          .send({ userId: 99999999 })
          .expect(404);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "NOT_FOUND",
            code: 404,
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: "User not found.",
              }),
            ]),
          }),
        );
      });

      test("should return 404 if user does not exist by username", async () => {
        const res = await agent
          .post("/requests")
          .send({ username: "nonexistentuser" })
          .expect(404);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "NOT_FOUND",
            code: 404,
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: "User not found.",
              }),
            ]),
          }),
        );
      });

      test("should return 409 if there is already a sent request", async () => {
        const res = await agent
          .post("/requests")
          .send({ userId: users.idol.id })
          .expect(409);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "CONFLICT",
            code: 409,
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: "You already sent a request to this user",
              }),
            ]),
          }),
        );
      });

      test("should return 409 if there is already a received request", async () => {
        const res = await agent
          .post("/requests")
          .send({ userId: users.fan.id })
          .expect(409);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "CONFLICT",
            code: 409,
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: "You already have a pending request from this user",
              }),
            ]),
          }),
        );
      });

      test("should return 409 if users are already friends", async () => {
        const res = await agent
          .post("/requests")
          .send({ userId: users.friend.id })
          .expect(409);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "CONFLICT",
            code: 409,
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: "You are already friends.",
              }),
            ]),
          }),
        );
      });

      test("should allow sending a request if a previous friendship has ended", async () => {
        const [friendAId, friendBId] = toSorted([
          users.main.id,
          users.friend.id,
        ]);
        await prisma.friendship.update({
          where: { friendAId_friendBId: { friendAId, friendBId } },
          data: { endedAt: new Date() },
        });

        const res = await agent
          .post("/requests")
          .send({ userId: users.friend.id })
          .expect(200);

        expect(res.body).toEqual({ success: true });
      });

      test("should successfully post a request by id", async () => {
        const res = await agent
          .post("/requests")
          .send({ userId: users.stranger.id })
          .expect(200);

        expect(res.body).toEqual({ success: true });

        const created = await prisma.request.findUnique({
          where: {
            senderId_receiverId: {
              senderId: users.main.id,
              receiverId: users.stranger.id,
            },
          },
        });
        expect(created).not.toBeNull();
        expect(socketIo.notifyUser).toHaveBeenCalledWith(
          [users.main.id, users.stranger.id],
          "add_request",
          {
            request: {
              senderId: users.main.id,
              receiverId: users.stranger.id,
            },
          },
        );
      });

      test("should successfully post a request by username", async () => {
        const res = await agent
          .post("/requests")
          .send({ username: users.stranger.username })
          .expect(200);

        expect(res.body).toEqual({ success: true });

        const created = await prisma.request.findUnique({
          where: {
            senderId_receiverId: {
              senderId: users.main.id,
              receiverId: users.stranger.id,
            },
          },
        });
        expect(created).not.toBeNull();
      });
    });
  });

  describe("DELETE /requests", () => {
    test("should return 401 if not logged in", async () => {
      const res = await request(app)
        .delete(`/requests/${users.idol.id}`)
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNAUTHORIZED",
          code: 401,
        }),
      );
    });

    describe("User is logged in", () => {
      test("should return 422 if otherUserId is not an integer", async () => {
        const res = await agent.delete("/requests/not-an-id").expect(422);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "UNPROCESSABLE_ENTITY",
            code: 422,
            errors: expect.arrayContaining([
              expect.objectContaining({
                type: "VALIDATION_ERROR",
                field: "otherUserId",
                location: "params",
              }),
            ]),
          }),
        );
      });

      test("should return 404 if the request does not exist", async () => {
        const res = await agent
          .delete(`/requests/${users.stranger.id}`)
          .expect(404);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "NOT_FOUND",
            code: 404,
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: "Request not found",
              }),
            ]),
          }),
        );
      });

      test("should return 404 if the request is between two other users", async () => {
        await prisma.request.create({
          data: { senderId: users.idol.id, receiverId: users.stranger.id },
        });

        const res = await agent
          .delete(`/requests/${users.stranger.id}`)
          .expect(404);

        expect(res.body).toEqual(
          expect.objectContaining({
            status: "NOT_FOUND",
            code: 404,
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: "Request not found",
              }),
            ]),
          }),
        );
      });

      test("should successfully delete sent request", async () => {
        const res = await agent
          .delete(`/requests/${users.idol.id}`)
          .expect(200);

        expect(res.body).toEqual({ success: true });

        const deleted = await prisma.request.findUnique({
          where: {
            senderId_receiverId: {
              senderId: users.main.id,
              receiverId: users.idol.id,
            },
          },
        });
        expect(deleted).toBeNull();
        expect(socketIo.notifyUser).toHaveBeenCalledWith(
          [users.main.id, users.idol.id],
          "remove_request",
          {
            request: {
              senderId: users.main.id,
              receiverId: users.idol.id,
            },
          },
        );
      });

      test("should successfully delete received request", async () => {
        const res = await agent.delete(`/requests/${users.fan.id}`).expect(200);

        expect(res.body).toEqual({ success: true });

        const deleted = await prisma.request.findUnique({
          where: {
            senderId_receiverId: {
              senderId: users.fan.id,
              receiverId: users.main.id,
            },
          },
        });
        expect(deleted).toBeNull();
        expect(socketIo.notifyUser).toHaveBeenCalledWith(
          [users.main.id, users.fan.id],
          "remove_request",
          {
            request: {
              senderId: users.fan.id,
              receiverId: users.main.id,
            },
          },
        );
      });
    });
  });
});
