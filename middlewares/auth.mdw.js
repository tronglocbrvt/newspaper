module.exports = function auth(req, res, next) {
    if (req.session.auth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/auth/log-in');
    }
    next();
  }