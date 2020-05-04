//File ./models/userModel.js

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserDetail = new Schema({
  name: {type: String, index: false},
  email: {type: String, sparse: true, index:true},
  password: {type: String, index: false},
  blogs: [],
  meetUps: []
});

module.exports = mongoose.model('userInfo', UserDetail);