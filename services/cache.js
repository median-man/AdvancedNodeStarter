const mongoose = require('mongoose')

const { exec } = mongoose.Query.prototype

mongoose.Query.prototype.exec = function() {
  console.log('cache: EXECUTING QUERY')
  return exec.apply(this, arguments)
}
