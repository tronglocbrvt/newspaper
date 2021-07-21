module.exports = function not_auth(req, res, next) {
    if (req.session.auth === true) {
      return res.redirect('/');
    }
    next();
  }