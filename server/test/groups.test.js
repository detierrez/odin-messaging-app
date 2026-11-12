const request = require("supertest");
const bcrypt = require("bcryptjs");
const { v2: cloudinary } = require("cloudinary");
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
let groups;
let agent;

beforeAll(async () => {
  jest.spyOn(socketIo, "addToGroupRoom").mockImplementation(() => {});
  jest.spyOn(socketIo, "removeFromGroupRoom").mockImplementation(() => {});
  jest.spyOn(socketIo, "closeGroupRoom").mockImplementation(() => {});
  jest.spyOn(socketIo, "notifyGroup").mockImplementation(() => {});
  jest.spyOn(socketIo, "notifyUser").mockImplementation(() => {});

  users = {
    main: {
      username: "grpmain",
      password: "password123",
    },
    friendMember: {
      username: "grpfriendmember",
      password: "password123",
    },
    friendOutsider: {
      username: "grpfriendoutsider",
      password: "password123",
    },
    friendExMember: {
      username: "grpfriendexmember",
      password: "password123",
    },
    stranger: {
      username: "grpstranger",
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

  const friendships = [
    getFriendshipKey(users.main.id, users.friendMember.id),
    getFriendshipKey(users.main.id, users.friendOutsider.id),
    getFriendshipKey(users.main.id, users.friendExMember.id),
  ];

  const userIds = Object.values(users).map((u) => u.id);
  await cleanupRelationships(userIds);
  await prisma.friendship.createMany({ data: friendships });

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
  await prisma.group.deleteMany({
    where: {
      participations: {
        some: { userId: { in: userIds } },
      },
    },
  });

  const ownedGroup = await prisma.group.create({
    data: {
      name: "Owned Group",
      description: "Group where main is ADMIN",
      avatarUrl: "https://test.com/owned.png",
      chat: { create: {} },
      participations: {
        create: [
          { userId: users.main.id, role: "ADMIN" },
          { userId: users.friendMember.id, role: "MEMBER" },
          {
            userId: users.friendExMember.id,
            role: "MEMBER",
            endedAt: new Date(),
          },
        ],
      },
    },
    include: { chat: true },
  });

  const memberGroup = await prisma.group.create({
    data: {
      name: "Member Group",
      description: "Group where main is MEMBER",
      chat: { create: {} },
      participations: {
        create: [
          { userId: users.friendMember.id, role: "ADMIN" },
          { userId: users.main.id, role: "MEMBER" },
        ],
      },
    },
    include: { chat: true },
  });

  const strangerGroup = await prisma.group.create({
    data: {
      name: "Stranger Group",
      description: "Secret description",
      avatarUrl: "https://test.com/stranger.png",
      chat: { create: {} },
      participations: {
        create: [{ userId: users.stranger.id, role: "ADMIN" }],
      },
    },
    include: { chat: true },
  });

  groups = {
    owned: ownedGroup,
    member: memberGroup,
    stranger: strangerGroup,
  };
});

afterAll(async () => {
  jest.restoreAllMocks();

  const userIds = Object.values(users)
    .map((u) => u.id)
    .filter(Boolean);

  await prisma.group.deleteMany({
    where: {
      participations: {
        some: { userId: { in: userIds } },
      },
    },
  });
  await cleanupRelationships(userIds);
  await prisma.user.deleteMany({
    where: {
      username: { in: Object.values(users).map((u) => u.username) },
    },
  });

  await store.shutdown();
});

describe("Testing group routes", () => {
  test("should return 401 if not logged in", async () => {
    await request(app).post("/groups").expect(401);
    await request(app).get("/groups/1").expect(401);
    await request(app).patch("/groups/1").expect(401);
    await request(app).delete("/groups/1/members/me").expect(401);
    await request(app).post("/groups/1/members").expect(401);
    await request(app).patch("/groups/1/members/1").expect(401);
    await request(app).delete("/groups/1/members/1").expect(401);
  });

  describe("POST /groups", () => {
    test("should return 422 if memberIds contains non-integer", async () => {
      const res = await agent
        .post("/groups")
        .send({ name: "Bad Group", memberIds: [1, "not-an-int", 2] })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
          }),
        ]),
      );
    });

    test("should return 422 if memberIds contains non-positive value", async () => {
      const res = await agent
        .post("/groups")
        .send({ name: "Bad Group", memberIds: [1, 2, -1] })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
          }),
        ]),
      );
    });

    test("should return 422 if name exceeds 64 characters", async () => {
      const res = await agent
        .post("/groups")
        .send({
          name: "n".repeat(65),
          memberIds: [users.friendMember.id],
        })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "name",
          }),
        ]),
      );
    });

    test("should return 422 if description exceeds 128 characters", async () => {
      const res = await agent
        .post("/groups")
        .send({
          name: "Valid Name",
          description: "d".repeat(129),
          memberIds: [users.friendMember.id],
        })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "description",
          }),
        ]),
      );
    });

    test("should return 400 if no other members are provided besides creator", async () => {
      await agent
        .post("/groups")
        .send({
          name: "Solo Group",
          memberIds: [users.main.id],
        })
        .expect(400);
    });

    test("should return 409 if any member is not in user's friend list", async () => {
      await agent
        .post("/groups")
        .send({
          name: "Mixed Group",
          memberIds: [users.friendMember.id, users.stranger.id],
        })
        .expect(409);
    });

    test("should successfully create a group with valid friends", async () => {
      const res = await agent
        .post("/groups")
        .send({
          name: "New Squad",
          description: "Our group chat",
          memberIds: [users.friendMember.id, users.friendOutsider.id],
        })
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const { id: newGroupId } = await prisma.group.findFirst({
        where: { name: "New Squad" },
        select: { id: true },
      });

      const groupRes = await agent.get(`/groups/${newGroupId}`).expect(200);
      expect(groupRes.body.group).toEqual(
        expect.objectContaining({
          id: newGroupId,
          name: "New Squad",
          description: "Our group chat",
          participations: expect.arrayContaining([
            { userId: users.main.id, groupId: newGroupId, role: "ADMIN" },
            {
              userId: users.friendMember.id,
              groupId: newGroupId,
              role: "MEMBER",
            },
            {
              userId: users.friendOutsider.id,
              groupId: newGroupId,
              role: "MEMBER",
            },
          ]),
        }),
      );
    });

    test("should successfully create a group with avatar upload", async () => {
      const uploadedUrl = "https://res.cloudinary.com/demo/group-avatar.png";
      jest
        .spyOn(cloudinary.uploader, "upload")
        .mockResolvedValueOnce({ secure_url: uploadedUrl });

      const res = await agent
        .post("/groups")
        .field("name", "Avatar Squad")
        .field("memberIds", users.friendMember.id)
        .attach("avatar", Buffer.from("fake-image"), {
          filename: "avatar.png",
          contentType: "image/png",
        })
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const { id: newGroupId } = await prisma.group.findFirst({
        where: { name: "Avatar Squad" },
        select: { id: true },
      });

      const groupRes = await agent.get(`/groups/${newGroupId}`).expect(200);
      expect(groupRes.body.group.avatarUrl).toBe(uploadedUrl);
    });
  });

  describe("GET /groups/:groupId", () => {
    test("should return 422 if groupId is not an integer", async () => {
      const res = await agent.get("/groups/not-an-id").expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "groupId",
            location: "params",
          }),
        ]),
      );
    });

    test("should return full group details (including description and participations) if user is an active member", async () => {
      const res = await agent.get(`/groups/${groups.owned.id}`).expect(200);

      expect(res.body).toEqual({
        group: {
          id: groups.owned.id,
          name: groups.owned.name,
          description: groups.owned.description,
          avatarUrl: groups.owned.avatarUrl,
          chat: { id: groups.owned.chat.id },
          participations: expect.arrayContaining([
            {
              userId: users.main.id,
              groupId: groups.owned.id,
              role: "ADMIN",
            },
            {
              userId: users.friendMember.id,
              groupId: groups.owned.id,
              role: "MEMBER",
            },
          ]),
        },
      });
      expect(res.body.group.participations).toHaveLength(2);
    });

    test("should return public group details (without description and participations) if user is not an active member", async () => {
      const res = await agent.get(`/groups/${groups.stranger.id}`).expect(200);

      expect(res.body).toEqual({
        group: {
          id: groups.stranger.id,
          name: groups.stranger.name,
          avatarUrl: groups.stranger.avatarUrl,
          chat: { id: groups.stranger.chat.id },
        },
      });
      expect(res.body.group.description).toBeUndefined();
      expect(res.body.group.participations).toBeUndefined();
    });

    test("should return null group if group does not exist", async () => {
      const res = await agent.get("/groups/99999999").expect(200);

      expect(res.body).toEqual({ group: null });
    });
  });

  describe("DELETE /groups/:groupId/members/me", () => {
    test("should return 422 if groupId is not an integer", async () => {
      await agent.delete("/groups/not-an-id/members/me").expect(422);
    });

    test("should return 403 if user is not an active member of the group", async () => {
      await agent
        .delete(`/groups/${groups.stranger.id}/members/me`)
        .expect(403);
    });

    test("should successfully leave group if user is a MEMBER", async () => {
      const res = await agent
        .delete(`/groups/${groups.member.id}/members/me`)
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const groupRes = await agent
        .get(`/groups/${groups.member.id}`)
        .expect(200);
      expect(groupRes.body.group.participations).toBeUndefined();
      expect(groupRes.body.group.description).toBeUndefined();
    });

    test("should successfully leave group and promote another member to ADMIN if user is an ADMIN", async () => {
      const res = await agent
        .delete(`/groups/${groups.owned.id}/members/me`)
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const friendAgent = request.agent(app);
      await friendAgent
        .post("/login")
        .send({
          username: users.friendMember.username,
          password: users.friendMember.password,
        })
        .expect(200);

      const groupRes = await friendAgent
        .get(`/groups/${groups.owned.id}`)
        .expect(200);
      expect(groupRes.body.group.participations).toEqual([
        {
          userId: users.friendMember.id,
          groupId: groups.owned.id,
          role: "ADMIN",
        },
      ]);
    });

    test("should successfully leave group if user is the last remaining member", async () => {
      await agent
        .delete(`/groups/${groups.owned.id}/members/${users.friendMember.id}`)
        .expect(200);

      const res = await agent
        .delete(`/groups/${groups.owned.id}/members/me`)
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const groupRes = await agent
        .get(`/groups/${groups.owned.id}`)
        .expect(200);
      expect(groupRes.body.group.participations).toBeUndefined();
    });
  });

  describe("PATCH /groups/:groupId", () => {
    test("should return 422 if groupId is not an integer", async () => {
      await agent
        .patch("/groups/not-an-id")
        .send({ name: "Updated" })
        .expect(422);
    });

    test("should return 403 if user is not an active member of the group", async () => {
      await agent
        .patch(`/groups/${groups.stranger.id}`)
        .send({ name: "Hijacked" })
        .expect(403);
    });

    test("should return 403 if user is a MEMBER but not an ADMIN", async () => {
      await agent
        .patch(`/groups/${groups.member.id}`)
        .send({ name: "Member Edit" })
        .expect(403);
    });

    test("should return 422 if neither name, description, nor avatar is provided", async () => {
      const res = await agent
        .patch(`/groups/${groups.owned.id}`)
        .send({})
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
          }),
        ]),
      );
    });

    test("should return 422 if name exceeds 64 characters", async () => {
      const res = await agent
        .patch(`/groups/${groups.owned.id}`)
        .send({ name: "n".repeat(65) })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "name",
          }),
        ]),
      );
    });

    test("should return 422 if description exceeds 128 characters", async () => {
      const res = await agent
        .patch(`/groups/${groups.owned.id}`)
        .send({ description: "d".repeat(129) })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "description",
          }),
        ]),
      );
    });

    test("should successfully update group name and description if user is ADMIN", async () => {
      const updates = {
        name: "Renamed Group",
        description: "Updated group description",
      };

      const res = await agent
        .patch(`/groups/${groups.owned.id}`)
        .send(updates)
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const groupRes = await agent
        .get(`/groups/${groups.owned.id}`)
        .expect(200);
      expect(groupRes.body.group).toEqual(
        expect.objectContaining({
          id: groups.owned.id,
          name: updates.name,
          description: updates.description,
        }),
      );
    });

    test("should successfully update group avatar if user is ADMIN", async () => {
      const uploadedUrl = "https://res.cloudinary.com/demo/updated-group.png";
      jest
        .spyOn(cloudinary.uploader, "upload")
        .mockResolvedValueOnce({ secure_url: uploadedUrl });

      const res = await agent
        .patch(`/groups/${groups.owned.id}`)
        .attach("avatar", Buffer.from("fake-image"), {
          filename: "avatar.png",
          contentType: "image/png",
        })
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const groupRes = await agent
        .get(`/groups/${groups.owned.id}`)
        .expect(200);
      expect(groupRes.body.group.avatarUrl).toBe(uploadedUrl);
    });
  });

  describe("POST /groups/:groupId/members", () => {
    test("should return 422 if groupId is not an integer", async () => {
      await agent
        .post("/groups/not-an-id/members")
        .send({ memberId: users.friendOutsider.id })
        .expect(422);
    });

    test("should return 403 if user is not an ADMIN of the group", async () => {
      await agent
        .post(`/groups/${groups.member.id}/members`)
        .send({ memberId: users.friendOutsider.id })
        .expect(403);
    });

    test("should return 422 if memberId is missing", async () => {
      const res = await agent
        .post(`/groups/${groups.owned.id}/members`)
        .send({})
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "memberId",
          }),
        ]),
      );
    });

    test("should return 422 if memberId is not a positive integer", async () => {
      const res = await agent
        .post(`/groups/${groups.owned.id}/members`)
        .send({ memberId: -3 })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "memberId",
          }),
        ]),
      );
    });

    test("should return 422 if trying to add oneself", async () => {
      await agent
        .post(`/groups/${groups.owned.id}/members`)
        .send({ memberId: users.main.id })
        .expect(422);
    });

    test("should return 404 if target user does not exist", async () => {
      await agent
        .post(`/groups/${groups.owned.id}/members`)
        .send({ memberId: 99999999 })
        .expect(404);
    });

    test("should return 409 if target user is already an active member", async () => {
      await agent
        .post(`/groups/${groups.owned.id}/members`)
        .send({ memberId: users.friendMember.id })
        .expect(409);
    });

    test("should return 422 if target user is not a friend", async () => {
      await agent
        .post(`/groups/${groups.owned.id}/members`)
        .send({ memberId: users.stranger.id })
        .expect(422);
    });

    test("should successfully add a friend to the group", async () => {
      const res = await agent
        .post(`/groups/${groups.owned.id}/members`)
        .send({ memberId: users.friendOutsider.id })
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const groupRes = await agent
        .get(`/groups/${groups.owned.id}`)
        .expect(200);
      expect(groupRes.body.group.participations).toEqual(
        expect.arrayContaining([
          {
            userId: users.friendOutsider.id,
            groupId: groups.owned.id,
            role: "MEMBER",
          },
        ]),
      );
    });

    test("should successfully re-add a former member who previously left", async () => {
      const res = await agent
        .post(`/groups/${groups.owned.id}/members`)
        .send({ memberId: users.friendExMember.id })
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const groupRes = await agent
        .get(`/groups/${groups.owned.id}`)
        .expect(200);
      expect(groupRes.body.group.participations).toEqual(
        expect.arrayContaining([
          {
            userId: users.friendExMember.id,
            groupId: groups.owned.id,
            role: "MEMBER",
          },
        ]),
      );
    });
  });

  describe("PATCH /groups/:groupId/members/:memberId", () => {
    test("should return 422 if groupId or memberId is not an integer", async () => {
      await agent
        .patch("/groups/not-an-id/members/1")
        .send({ role: "ADMIN" })
        .expect(422);
      await agent
        .patch(`/groups/${groups.owned.id}/members/not-an-id`)
        .send({ role: "ADMIN" })
        .expect(422);
    });

    test("should return 403 if user is not an ADMIN of the group", async () => {
      await agent
        .patch(`/groups/${groups.member.id}/members/${users.friendMember.id}`)
        .send({ role: "MEMBER" })
        .expect(403);
    });

    test("should return 422 if role is missing", async () => {
      const res = await agent
        .patch(`/groups/${groups.owned.id}/members/${users.friendMember.id}`)
        .send({})
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "role",
          }),
        ]),
      );
    });

    test("should return 422 if role is invalid", async () => {
      const res = await agent
        .patch(`/groups/${groups.owned.id}/members/${users.friendMember.id}`)
        .send({ role: "OWNER" })
        .expect(422);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "VALIDATION_ERROR",
            field: "role",
          }),
        ]),
      );
    });

    test("should return 422 if trying to update own role", async () => {
      await agent
        .patch(`/groups/${groups.owned.id}/members/${users.main.id}`)
        .send({ role: "MEMBER" })
        .expect(422);
    });

    test("should return 404 if target user is not an active member of the group", async () => {
      await agent
        .patch(`/groups/${groups.owned.id}/members/${users.friendOutsider.id}`)
        .send({ role: "ADMIN" })
        .expect(404);
    });

    test("should successfully update member role", async () => {
      const res = await agent
        .patch(`/groups/${groups.owned.id}/members/${users.friendMember.id}`)
        .send({ role: "ADMIN" })
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const groupRes = await agent
        .get(`/groups/${groups.owned.id}`)
        .expect(200);
      expect(groupRes.body.group.participations).toEqual(
        expect.arrayContaining([
          {
            userId: users.friendMember.id,
            groupId: groups.owned.id,
            role: "ADMIN",
          },
        ]),
      );
    });
  });

  describe("DELETE /groups/:groupId/members/:memberId", () => {
    test("should return 422 if groupId or memberId is not an integer", async () => {
      await agent.delete("/groups/not-an-id/members/1").expect(422);
      await agent
        .delete(`/groups/${groups.owned.id}/members/not-an-id`)
        .expect(422);
    });

    test("should return 403 if user is not an ADMIN of the group", async () => {
      await agent
        .delete(`/groups/${groups.member.id}/members/${users.friendMember.id}`)
        .expect(403);
    });

    test("should return 422 if trying to remove oneself", async () => {
      await agent
        .delete(`/groups/${groups.owned.id}/members/${users.main.id}`)
        .expect(422);
    });

    test("should return 404 if target user is not an active member of the group", async () => {
      await agent
        .delete(`/groups/${groups.owned.id}/members/${users.friendOutsider.id}`)
        .expect(404);
    });

    test("should successfully remove member from the group", async () => {
      const res = await agent
        .delete(`/groups/${groups.owned.id}/members/${users.friendMember.id}`)
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const groupRes = await agent
        .get(`/groups/${groups.owned.id}`)
        .expect(200);
      expect(groupRes.body.group.participations).toEqual([
        {
          userId: users.main.id,
          groupId: groups.owned.id,
          role: "ADMIN",
        },
      ]);
    });
  });
});
