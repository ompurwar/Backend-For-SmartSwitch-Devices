var mongoose = require('mongoose');
var userschema = new mongoose.Schema({
  Email: {type: String, unique: true, required: true, trim: true},
  //userName: {type: String, unique: true, required: true, trim: true},
  password: {type: String, required: true},
  passwordConf: {type: String, required: true}
});

var User = mongoose.model('User',userschema);
module.exports = User;