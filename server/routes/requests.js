const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v } = m;

const requests = Router();

requests.get("/", c.requests.getRequests);
requests.post("/", v.postRequest, c.requests.postRequest);
requests.delete(
  "/:otherUserId",
  v.paramId("otherUserId"),
  c.requests.deleteRequest,
);

module.exports = requests;

