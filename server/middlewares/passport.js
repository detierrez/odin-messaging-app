const { Strategy: JwtStrategy } = require("passport-jwt");
const { fromAuthHeaderAsBearerToken } = require("passport-jwt").ExtractJwt;
const jwtPassport = require("passport");
const prisma = require("../lib/prisma");

const jwtStrategry = new JwtStrategy(
  {
    jwtFromRequest: fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (token, done) => {
    const { username } = token;
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (user) {
        console.log("Login success: ", { user });
        return done(null, user);
      }
      return done(null, false, new Error("User does not exists"));
    } catch (error) {
      return done(error);
    }
  },
);

jwtPassport.use(jwtStrategry);

// const jwtAuthenticate = jwtPassport.authenticate("jwt", {
//   session: false,
//   // failWithError: true,
// });

const strictAuthenticate = jwtPassport.authenticate("jwt", {
  session: false,
  failWithError: true,
});

const looseAuthenticate = function (req, res, next) {
  jwtPassport.authenticate(
    "jwt",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        console.log("Authentication failed: " + info.message);
        return next();
      }
      req.user = user;
      return next();
    },
  )(req, res, next);
};

module.exports = { strictAuthenticate, looseAuthenticate };
