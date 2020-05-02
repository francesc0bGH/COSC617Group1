var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BlogSchema = new Schema({
  name: {type: String, index: false},
  emale: {type: String, index:false},
  message: {type: String, index: false},
});

MessageSchema
.virtual('url')
.get(function () {
  return '/blog/' + this._id;
});

module.exports = mongoose.model('messageInfo', BlogSchema);