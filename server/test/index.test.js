const { rocks } = require("../routes/index");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.json());
app.use("/rocks", rocks);

test("returns all rocks", (done) => {
  request(app)
    .get("/rocks")
    .expect((res) => {
      expect(res.body).toEqual(
        expect.arrayOf(
          expect.objectContaining({
            id: expect.any(Number),
            size: expect.any(Number),
          }),
        ),
      );
    })
    .expect(200, done);
});
