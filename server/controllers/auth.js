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
