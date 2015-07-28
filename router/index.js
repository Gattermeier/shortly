var session = require('express-session');
var db = require('../app/config');
var Users = require('../app/collections/users');
var User = require('../app/models/user');
var Links = require('../app/collections/links');
var Link = require('../app/models/link');
var Click = require('../app/models/click');

var util = require('../lib/utility');

module.exports = function(app, passport) {

  app.get('/',
    function(req, res) {
      console.log(req.session);
      res.render('index', {
        messages: req.flash(),
        data: {},
        session: req.session
      });
    });

  app.get('/create',
    function(req, res) {
      res.render('index', {
        messages: req.flash(),
        data: {},
        session: req.session
      });
    });

  app.get('/links',
    function(req, res) {
      Links.reset().fetch().then(function(links) {
        res.send(200, links.models);
      });
    });

  app.post('/links', util.isLoggedIn,
    function(req, res) {
      console.log('POST on /links');
      var uri = req.body.url;

      if (!util.isValidUrl(uri)) {
        console.log('Not a valid url: ', uri);
        return res.send(404);
      }

      new Link({
        url: uri
      }).fetch().then(function(found) {
        if (found) {
          res.send(200, found.attributes);
        } else {
          util.getUrlTitle(uri, function(err, title) {
            if (err) {
              console.log('Error reading URL heading: ', err);
              return res.send(404);
            }

            var link = new Link({
              url: uri,
              title: title,
              base_url: req.headers.origin
            });

            link.save().then(function(newLink) {
              Links.add(newLink);
              res.send(200, newLink);
            });
          });
        }
      });
    });

  app.get('/signup',
    function(req, res) {
      res.render('signup', {
        messages: req.flash(),
        data: {},
        session: req.session
      });
    });

  app.post('/signup', passport.authenticate('local-register', {
    successRedirect: '/',
    successFlash: true,
    failureRedirect: '/signup',
    failureFlash: true
  }));

  app.get('/login',
    function(req, res) {
      res.render('login', {
        messages: req.flash('error'),
        data: {},
        session: req.session
      });
    });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    successFlash: true,
    failureRedirect: '/login',
    failureFlash: true
  }));


  app.get('/auth/github',
    passport.authenticate('github', {
      scope: ['user:email']
    }),
    function(req, res) {});

  app.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login',
      failureFlash: true,
      successRedirect: '/',
      successFlash: true
    }),
    function(req, res) {
      console.log('Github authenticated, ', req.session.passport.user);
      //  here it is loosing the session .. 
      // res.redirect('/');
    });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  })

  app.get('/*', function(req, res) {
    new Link({
      code: req.params[0]
    }).fetch().then(function(link) {
      if (!link) {
        res.redirect('/', {
          messages: req.flash()
        });
      } else {
        var click = new Click({
          link_id: link.get('id')
        });

        click.save().then(function() {
          db.knex('urls')
            .where('code', '=', link.get('code'))
            .update({
              visits: link.get('visits') + 1,
            }).then(function() {
              return res.redirect(link.get('url'));
            });
        });
      }
    });
  });
}