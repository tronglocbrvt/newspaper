const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const env = require('../env.js')
module.exports = function (app) 
{
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: '193740419851-12t4431fk4011feavrqired692kbtji9.apps.googleusercontent.com',
    clientSecret: 's3dd-Q3-N5Z5mx3NjFZhBtdl',
    callbackURL: env.WEB_URI + "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) 
  {
      return cb(null, profile);
  }
));

passport.use(new FacebookStrategy(
    {
      clientID: '552227225807906',
      clientSecret: '50918f0acce629751749ded2a149ebcf',
      callbackURL:  env.WEB_URI + "/auth/facebook/callback",
    },
    function(accessToken, refreshToken, profile, done) {    
      done(null, profile);
    }
));

}



