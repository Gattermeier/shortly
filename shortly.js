var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var persistentSession = require('./router/persistentSession');
var passport = require('passport');
var flash = require('connect-flash');
// var LocalStrategy = require('passport-local');
// var passport = require('passport');
require('./app/passport-config')(passport);

var router = require('./router');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(session({
  secret: 'something super secret here for the session',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser('something super secret here for the cookie'));

app.use(express.static(__dirname + '/public'));

persistentSession(app);
router(app, passport);

console.log('Shortly is listening on 4568');
app.listen(4568);