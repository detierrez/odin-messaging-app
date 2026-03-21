require("dotenv/config");
const { PORT } = process.env;

const cors = require("cors");
const express = require("express");
const m = require("./middlewares");
const { rocks } = require("./routes");

const app = express();
app.use(express.json());
app.use(cors("localhost:5173"));

app.use("/", m.logger);

// app.use("/", authRouter);
app.use("/rocks", rocks);

app.use("/", m.throw404);
app.use("/", m.maskInternalErrors);
app.use("/", m.sendError);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
