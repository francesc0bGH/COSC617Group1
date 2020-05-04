var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BlogSchema = new Schema({
  title: {type: String, index: false},
  location: {type: String, index:false},
  description: {type: String, index: false},
  activity: {type: String, index: false}

});

BlogSchema
.virtual('url')
.get(function () {
  return '/blog/' + this._id;
});

module.exports = mongoose.model('blogInfo', BlogSchema);