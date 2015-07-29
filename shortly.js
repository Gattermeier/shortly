var mongoose = require('mongoose');
var config = require('./config');
var express = require('express');
var partials = require('express-partials');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var persistentSession = require('./router/persistentSession');
var passport = require('passport');

require('./app/passport-config')(passport);

var flash = require('connect-flash');
var router = require('./router');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());
app.use(session({
  secret: 'something super secret here for the session',
  saveUninitialized: true,
  resave: true,
  cookie: {
    expires: false
  }
}));

//SUPPORT PERSISTENT SESSIONS
persistentSession(app);


app.use(cookieParser('something super secret here for the session'));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(__dirname + '/public'));
// ROUTER
router(app, passport);

var port = 4568;

mongoose.connect(config, function(err) {
  if (err) throw err;
  app.listen(port, function() {
    console.log('Shortly is listening on', port);
  });
})