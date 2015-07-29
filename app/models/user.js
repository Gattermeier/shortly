// var db = require('../config');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
// var Promise = require('bluebird');

var userSchema = mongoose.Schema({
  name: String,
  password: String,
  githubId: String
});


module.exports = mongoose.model('User', userSchema);