module.exports.postLogin = (req, res) => {
  res.json({ success: true });
};

module.exports.postLogout = (req, res) => {
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
