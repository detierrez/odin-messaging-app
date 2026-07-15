const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { HttpError } = require("../lib/errors");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!user) {
        throw new HttpError(401, "Incorrect username or password", {
          type: "FAILED_AUTHENTICATION",
        });
      }

      // const isPasswordValid = await bcrypt.compare(password, user.password);
      // if (!isPasswordValid) {
      //   throw new httpError(401, [
      //     { reason: "Incorrect username or password" },
      //   ]);
      // }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
});

const session = passport.session();
const authenticate = passport.authenticate("local", { failWithError: true });
const protect = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  throw new HttpError(401, "Unauthenticated.", {
    type: "UNAUTHENTICATED",
  });
};

module.exports = { authenticate, protect, session };
