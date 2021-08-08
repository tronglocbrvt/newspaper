module.exports = {
  auth: function (req, res, next) {
    if (req.session.auth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/auth/log-in');
    }
    next();
  },

  auth_admin: function (req, res, next) {
    if (req.session.authUser.is_admin === 0) {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/auth/log-in');
    }
    next();
  },

  auth_writer: function (req, res, next) {
    if (req.session.authUser.is_writer === 0) {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/auth/log-in');
    }
    next();
  },

  auth_editor: function (req, res, next) {
    if (req.session.authUser.is_editor === 0) {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/auth/log-in');
    }
    next();
  }
}