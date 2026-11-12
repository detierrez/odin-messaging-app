const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("../lib/prisma");

const store = new PrismaSessionStore(prisma, {
  checkPeriod: 10 * 60 * 1000, //ms: 10 minutes interval to check for expired sessions
  dbRecordIdIsSessionId: true,
});

const session = expressSession({
  cookie: {
    maxAge: Number(process.env.SESSION_MAX_AGE) || 7 * 24 * 60 * 60 * 1000, //ms: 7 days
  },
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store,
});

module.exports.session = session;
module.exports.store = store;
