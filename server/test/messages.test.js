const { messages } = require("../routes/index");

const request = require("supertest");
const express = require("express");
const { expect } = require("@jest/globals");
const app = express();

app.use(express.json());
app.use("/messages", messages);

test("returns all messages", async () => {
  await request(app)
    .get("/messages")
    .expect((res) => {
      expect(res.body).toEqual(
        expect.arrayOf(
          expect.objectContaining({
            id: expect.any(Number),
            text: expect.any(String),
          }),
        ),
      );
    })
    .expect(200);
});

test("posts a message", async () => {
  const data = { fromId: 1, toId: 2, text: "what's good" };
  await request(app)
    .post("/messages")
    .send(data)
    .expect((res) => {
      expect(res.body).toEqual({ id: expect.any(Number), ...data });
    })
    .expect(200);
});
