require("dotenv/config");
const cors = require("cors");
const express = require("express");
const index = require("./routes");

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use("/", index);

module.exports = app;