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
      res.render('index', {
        data: {},
        session: req.session
      });
    });

  app.get('/create',
    function(req, res) {
      res.render('index', {
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
        data: {},
        session: req.session
      });
    });

  app.post('/signup', passport.authenticate('local-register', {
    successRedirect: '/',
    successFlase: true,
    failureRedirect: '/signup',
    failureFlash: true
  }));

  // app.post('/signup',
  //   function(req, res) {
  //     console.log(req.body);

  //     var username = req.body.username;
  //     var password = req.body.password;

  //     if (!util.isValidEmail(username)) {
  //       console.log('Not a valid email: ', username);
  //       res.render('signup', {
  //         data: {
  //           warning: 'Not a valid email.'
  //         },
  //         session: req.session
  //       });
  //     } else {
  //       new User({
  //           username: username
  //         })
  //         .fetch()
  //         .then(function(found) {
  //           if (found) {
  //             res.render('login', {
  //               data: {
  //                 warning: 'This email is already registered.'
  //               },
  //               session: req.session
  //             });
  //           } else {
  //             util.encryptPWD(password, function(hash) {
  //               var user = new User({
  //                 username: username,
  //                 password: hash
  //               });

  //               user.save().then(function(newUser) {
  //                 req.session.user = true;
  //                 res.redirect('create');
  //               });
  //             })
  //           }
  //         })
  //     }
  //   });

  app.get('/login',
    function(req, res) {
      res.render('login', {
        data: {},
        session: req.session
      });
    });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    successFlase: true,
    failureRedirect: '/login',
    failureFlash: true
  }));

  // app.post('/login',
  //   function(req, res) {

  //     var username = req.body.username;
  //     var password = req.body.password;

  //     new User({
  //       username: username
  //     }).fetch().then(function(found) {
  //       if (found) {
  //         util.checkPWD(found, password, function(match) {
  //           if (match) {
  //             req.session.user = true;
  //             res.redirect('create')
  //           } else {
  //             res.render('login', {
  //               data: {
  //                 warning: 'Please enter correct email & password credentials'
  //               }
  //             });
  //           }
  //         })
  //       } else {
  //         res.render('signup', {
  //           data: {
  //             warning: 'Please enter correct email & password credentials'
  //           }
  //         })
  //       }
  //     });
  //   });

  app.get('/logout', function(req, res) {
    req.logout();
    req.session.user = false;
    res.redirect('/');
  })

  app.get('/*', function(req, res) {
    new Link({
      code: req.params[0]
    }).fetch().then(function(link) {
      if (!link) {
        res.redirect('/');
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