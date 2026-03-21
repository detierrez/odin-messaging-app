const index = require("../routes/index");

const request = require("supertest");
const express = require("express");
const { expect } = require("@jest/globals");
const app = express();

app.use(express.json());
app.use("/", index);

// test("fail if doesn't authenticate", async () => {
//   await request(app).get("/").expect(401);
// });

// test("returns a chat", async () => {
//   const id = 1;
//   const contactId = 2;

//   await request(app)
//     .get(`/contacts/${contactId}/messages?id=${id}`)
//     .expect((res) => {
//       expect(Array.isArray(res.body)).toBe(true);

//       res.body.forEach((message) => {
//         expect(message).toEqual(
//           expect.objectContaining({
//             id: expect.any(Number),
//             text: expect.any(String),
//           }),
//         );

//         const validParticipants =
//           (message.fromId === id && message.toId === contactId) ||
//           (message.fromId === contactId && message.toId === id);
//         expect(validParticipants).toBe(true);
//       });
//     })
//     .expect(200);
// });

// test("posts a message", async () => {
//   const id = 1;
//   const contactId = 2;
//   const text = "what good";

//   await request(app)
//     .post(`/contacts/${contactId}/messages?id=${id}`)
//     .send({ text })
//     .expect((res) => {
//       expect(res.body).toEqual({
//         id: expect.any(Number),
//         fromId: id,
//         toId: contactId,
//         text,
//       });
//     })
//     .expect(200);
// });

test("gets the last message of each conversation", async () => {
  const id = 3;

  await request(app)
    .get(`/inbox?id=${id}`)
    // .expect((res) => {
    //   expect(res.body).toEqual({
    //     id: expect.any(Number),
    //     fromId: id,
    //     toId: contactId,
    //     text,
    //   });
    // })
    .expect(200);
});
