var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MeetupDetail = new Schema({
  location: {type: String, index: false},
  ename: {type: String, index:false},
  description: {type: String, index: false},
  keywords: {type: String, index: false},
  start: {type: String, index: false},
  end: {type: String, index: false},
  email: {type: String, index: false}
});

module.exports = mongoose.model('meetupInfo', MeetupDetail);