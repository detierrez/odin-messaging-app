const { HttpError } = require("../lib/errors");

module.exports.getUnauthenticated = (req, res) => {
  throw new HttpError(401, "Unauthenticated.", {
    type: "UNAUTHENTICATED",
  });
};

module.exports.postLogin = (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports.postLogout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.json({ success: true });
  });
};

module.exports.protected = (req, res) => {
  res.json({ success: `welcome, ${req.user.username}` });
};
