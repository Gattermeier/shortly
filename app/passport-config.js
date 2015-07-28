var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var util = require('../lib/utility');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(username, done) {
    new User({
      username: username
    }).fetch().then(function(user) {
      done(null, user);
    })
  });

  passport.use('local-register', new LocalStrategy({
    username: 'username',
    password: 'password',
    passReqToCallback: true
  }, function(req, username, password, done) {
    console.log(req, username, password);
    new User({
      username: username
    }).fetch().then(function(match) {
      if (match) {
        console.log('user exists');

        return done(null, false, {
          message: 'user exists already'
        });

      } else {
        console.log('new user');
        util.encryptPWD(password, function(hash) {
          var user = new User({
            username: username,
            password: hash
          });

          user.save().then(function(newUser) {
            done(null, newUser, {
              message: 'new user created'
            });
          });
        })
      }
    })

  }));

  passport.use('local-login', new LocalStrategy({
      username: 'username',
      password: 'password',
      passReqToCallback: true
    },
    function(req, username, password, done) {
      console.log(req, username, password);
      new User({
        username: username
      }).fetch().then(function(user) {
        if (user) {
          console.log('user exists', user);
          return done(null, user);
        } else {
          console.log('unknown user');
        }
      })
    }));

}