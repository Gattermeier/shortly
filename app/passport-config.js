var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github2').Strategy;
// MODIFY
var GITHUB_CLIENT_ID = "249fd767df9892664c34"
var GITHUB_CLIENT_SECRET = "94733207a40f34481cd195ac9144191417899f49";
var CALLBACK_URL = "http://127.0.0.1:4568/auth/github/callback";

var User = require('./models/user');

var util = require('../lib/utility');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    new User({
      id: id
    }).fetch().then(function(user) {
      if (user) {
        done(null, user);
      }
    })
  });

  passport.use('local-register', new LocalStrategy({
    username: 'username',
    password: 'password',
    passReqToCallback: true
  }, function(req, username, password, done) {
    new User({
      username: username
    }).fetch().then(function(match) {
      if (match) {
        console.log('user exists');

        done(null, false, {
          message: 'A user with this email address already exists.'
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
              message: 'New user created.'
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
      new User({
        username: username
      }).fetch().then(function(user) {
        if (user) {
          done(null, user, {
            message: 'Welcome back.'
          });
        } else {
          return done(null, false, {
            message: 'Login failed. Please try again'
          });
        }
      })
    }));

  passport.use(new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
      new User({
        githubId: profile.id
      }).fetch().then(function(user) {
        if (user) {
          console.log('Existing user: ', user)
          done(null, user);
        } else {
          var user = new User({
            githubId: profile.id
          });

          user.save().then(function(newUser) {
            console.log('New user: ', newUser);
            done(null, newUser);
          })
        }
      });
    }
  ));
}