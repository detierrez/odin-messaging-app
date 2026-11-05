const request = require("supertest");
const bcrypt = require("bcryptjs");
const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const { store } = require("../middlewares/session");
const prisma = require("../lib/prisma");
const app = require("../app");

const TEST_USER = {
  username: "testuser",
  password: "pepega342",
};

beforeAll(async () => {
  const hash = await bcrypt.hash(TEST_USER.password, 10);

  await prisma.user.upsert({
    where: { username: TEST_USER.username },
    update: {
      password: {
        upsert: {
          create: { hash },
          update: { hash },
        },
      },
    },
    create: {
      username: TEST_USER.username,
      password: {
        create: { hash },
      },
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { username: TEST_USER.username },
  });

  await store.shutdown();
});

describe("Auth Routes (/)", () => {
  describe("POST /login", () => {
    test("should return 422 if username and password are missing", async () => {
      const res = await request(app).post("/login").send({}).expect(422);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNPROCESSABLE_ENTITY",
          code: 422,
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: "VALIDATION_ERROR",
              field: "username",
            }),
            expect.objectContaining({
              type: "VALIDATION_ERROR",
              field: "password",
            }),
          ]),
        }),
      );
    });

    test("should return 422 if username has invalid format", async () => {
      const res = await request(app)
        .post("/login")
        .send({ username: "123user", password: "password123" })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "username",
            message: "username must start with a letter",
          }),
        ]),
      );
    });

    test("should return 422 if password is shorter than 8 characters", async () => {
      const res = await request(app)
        .post("/login")
        .send({ username: "validuser", password: "short" })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            message: "password must be between 8 and 64 characters long",
          }),
        ]),
      );
    });

    test("should return 422 if password is longer than 64 characters", async () => {
      const res = await request(app)
        .post("/login")
        .send({
          username: "validuser",
          password:
            "averylongpasswordthatwilldefinitelynotpassanychecksintheapplication",
        })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            message: "password must be between 8 and 64 characters long",
          }),
        ]),
      );
    });

    test("should return 401 if user does not exist", async () => {
      const res = await request(app)
        .post("/login")
        .send({ username: "nonexistentuser", password: "password123" })
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNAUTHORIZED",
          code: 401,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "Incorrect username or password",
              type: "FAILED_AUTHENTICATION",
            }),
          ]),
        }),
      );
    });

    test("should return 401 if password is incorrect", async () => {
      const res = await request(app)
        .post("/login")
        .send({ username: TEST_USER.username, password: "wrongpassword" })
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "UNAUTHORIZED",
          code: 401,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "Incorrect username or password",
              type: "FAILED_AUTHENTICATION",
            }),
          ]),
        }),
      );
    });

    test("should login successfully with valid credentials and return user", async () => {
      const res = await request(app)
        .post("/login")
        .send({ username: TEST_USER.username, password: TEST_USER.password })
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          success: true,
          user: expect.objectContaining({
            id: expect.any(Number),
          }),
        }),
      );
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("POST /logout", () => {
    test("should logout successfully and revoke access to protected route", async () => {
      const agent = request.agent(app);

      // Login first
      await agent
        .post("/login")
        .send({ username: TEST_USER.username, password: TEST_USER.password })
        .expect(200);

      // Verify authenticated
      await agent.get("/users/me").expect(200);

      // Logout
      const logoutRes = await agent.post("/logout").expect(200);
      expect(logoutRes.body).toEqual({ success: true });

      // Access protected route again - should now be unauthorized
      const protectedRes = await agent.get("/users/me").expect(401);
      expect(protectedRes.body).toEqual(
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

    test("should succeed even if not currently logged in", async () => {
      const res = await request(app).post("/logout").expect(200);
      expect(res.body).toEqual({ success: true });
    });
  });
});
