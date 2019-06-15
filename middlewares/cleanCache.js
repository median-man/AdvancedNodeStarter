const { clearHash } = require('../services/cache')

// express middleware that does not handle an error will not be
// run if an error is thrown by a preceding middleware function
module.exports = async (req, res, next) => {
  // wait for route handling to finish before handling
  // task of clearing the cache in case an error occurs in
  // which case the cache should not be cleared
  await next()
  clearHash(req.user.id)
}
