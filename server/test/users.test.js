const request = require("supertest");
const bcrypt = require("bcryptjs");
const { v2: cloudinary } = require("cloudinary");
const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const { store } = require("../middlewares/session");
const prisma = require("../lib/prisma");
const socketIo = require("../lib/socket-io");
const app = require("../app");

const users = {
  user_1: {
    username: "testuser1",
    password: "testuser1",
    alias: "Test user 1",
    avatarUrl: "https://test.com/avatar.png",
    description: "I don't exist",
  },
  user_2: {
    username: "testuser2",
    password: "testuser2",
    alias: "Test user 2",
    avatarUrl: "https://test.com/avatar2.png",
    description: "I don't exist either",
  },
};

describe("Testing users routes", () => {
  let agent;

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
        username: users.user_1.username,
        password: users.user_1.password,
      })
      .expect(200);
  });

  afterAll(async () => {
    jest.restoreAllMocks();

    await prisma.user.deleteMany({
      where: {
        OR: [
          { username: users.user_1.username },
          { username: users.user_2.username },
        ],
      },
    });

    await store.shutdown();
  });

  describe("GET /users/me", () => {
    test("should return logged in user", async () => {
      const res = await agent.get("/users/me").expect(200);

      expect(res.body).toEqual({
        user: {
          id: users.user_1.id,
          username: users.user_1.username,
          alias: users.user_1.alias,
          avatarUrl: users.user_1.avatarUrl,
          description: users.user_1.description,
        },
      });
    });

    test("should return 401 if not logged in", async () => {
      const res = await request(app).get("/users/me").expect(401);

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
  });

  describe("PATCH /users/me", () => {
    test("should update user alias and description if authenticated", async () => {
      const updates = {
        alias: "Updated Alias",
        description: "Updated description",
      };

      const res = await agent.patch("/users/me").send(updates).expect(200);

      expect(res.body).toEqual({
        user: expect.objectContaining({
          id: users.user_1.id,
          username: users.user_1.username,
          alias: updates.alias,
          description: updates.description,
        }),
      });
      expect(socketIo.notifyUser).toHaveBeenCalledWith(
        users.user_1.id,
        "update_user",
        {
          user: {
            id: users.user_1.id,
            alias: updates.alias,
            description: updates.description,
          },
        },
      );
    });

    test("should update user with only alias provided", async () => {
      const res = await agent
        .patch("/users/me")
        .send({ alias: "Only Alias" })
        .expect(200);

      expect(res.body.user).toEqual(
        expect.objectContaining({
          id: users.user_1.id,
          alias: "Only Alias",
        }),
      );
    });

    test("should update user with only description provided", async () => {
      const res = await agent
        .patch("/users/me")
        .send({ description: "Only description" })
        .expect(200);

      expect(res.body.user).toEqual(
        expect.objectContaining({
          id: users.user_1.id,
          description: "Only description",
        }),
      );
    });

    test("should update user avatar when file is uploaded", async () => {
      const uploadedAvatarUrl = "https://res.cloudinary.com/demo/avatar.png";
      const uploadSpy = jest
        .spyOn(cloudinary.uploader, "upload")
        .mockResolvedValueOnce({ secure_url: uploadedAvatarUrl });

      const res = await agent
        .patch("/users/me")
        .attach("avatar", Buffer.from("fake-image-content"), {
          filename: "avatar.png",
          contentType: "image/png",
        })
        .expect(200);

      expect(uploadSpy).toHaveBeenCalledTimes(1);
      expect(res.body.user).toEqual(
        expect.objectContaining({
          id: users.user_1.id,
          avatarUrl: uploadedAvatarUrl,
        }),
      );
    });

    test("should return 401 if not logged in", async () => {
      const res = await request(app)
        .patch("/users/me")
        .send({ alias: "Hacker" })
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNAUTHORIZED",
          code: 401,
        }),
      );
    });

    test("should return 422 if neither alias, description, nor avatar is provided", async () => {
      const res = await agent.patch("/users/me").send({}).expect(422);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNPROCESSABLE_ENTITY",
          code: 422,
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: "VALIDATION_ERROR",
              message: "Either alias, description or avatar must be provided",
            }),
          ]),
        }),
      );
    });

    test("should return 422 if alias exceeds 64 characters", async () => {
      const res = await agent
        .patch("/users/me")
        .send({ alias: "a".repeat(65) })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "alias",
            message: "Alias cannot exceed 64 characters",
          }),
        ]),
      );
    });

    test("should return 422 if description exceeds 128 characters", async () => {
      const res = await agent
        .patch("/users/me")
        .send({ description: "d".repeat(129) })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "description",
            message: "Description cannot exceed 128 characters",
          }),
        ]),
      );
    });
  });

  describe("GET /users/:userId", () => {
    test("should return user if exists", async () => {
      const res = await agent.get(`/users/${users.user_2.id}`).expect(200);

      expect(res.body).toEqual({
        user: {
          id: users.user_2.id,
          username: users.user_2.username,
          alias: users.user_2.alias,
          avatarUrl: users.user_2.avatarUrl,
          description: users.user_2.description,
        },
      });
    });

    test("should return 401 if not logged in", async () => {
      const res = await request(app)
        .get(`/users/${users.user_2.id}`)
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNAUTHORIZED",
          code: 401,
        }),
      );
    });

    test("should return 404 if user does not exist", async () => {
      const nonExistentId = 99999999;
      const res = await agent.get(`/users/${nonExistentId}`).expect(404);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "NOT_FOUND",
          code: 404,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "User not found",
            }),
          ]),
        }),
      );
    });

    test("should return 422 if userId is not an integer", async () => {
      const res = await agent.get("/users/not-an-id").expect(422);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNPROCESSABLE_ENTITY",
          code: 422,
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: "VALIDATION_ERROR",
              field: "userId",
              location: "params",
            }),
          ]),
        }),
      );
    });
  });
});
