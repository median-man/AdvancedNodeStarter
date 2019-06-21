const mongoose = require('mongoose')
const User = mongoose.model('User');

/* 
  Returns promise which resolves to a test User
  instance
*/
exports.createUser = () => {
  return new User({}).save();
}
