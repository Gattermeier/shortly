var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var router = require('./router');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
app.use(session({
  secret: 'something super secret here for the session',
  saveUninitialized: true,
  resave: true
}));
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser('something super secret here for the cookie'));

app.use(express.static(__dirname + '/public'));

router(app);

console.log('Shortly is listening on 4568');
app.listen(4568);