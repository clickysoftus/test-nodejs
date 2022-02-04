const { ExtractJwt, Strategy } = require("passport-jwt");
const { User } = require("../models");
const CONFIG = require("../config/config");
const { to } = require("../services/util.service");

module.exports = passport => {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = CONFIG.jwt_encryption;

  passport.use(
    new Strategy(opts, async (jwt_payload, done) => {
      User.findByPk(jwt_payload.user_id)
        .then(user => {
          if (user) {
            return done(null, user);
          }

          return done(null, false);
        })
        .catch(err => {
          done(err, false);
        });

      // let err, user;

      // [err, user] = await to(User.findByPk(jwt_payload.user_id));

      // if (err) return done(err, false);
      // if (user) {
      //   return done(null, user);
      // } else {
      //   return done(null, false);
      // }
    })
  );
};
