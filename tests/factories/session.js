const { Buffer } = require('safe-buffer')
const Keygrip = require('keygrip')
const key = require('../../config/keys')

const keygrip = new Keygrip([key.cookieKey])

function createSession(userId) {
  const sessionObject = {
    passport: {
      user: userId
    }
  }
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64')
  const sig = keygrip.sign(`session=${session}`)
  return { session, sig }
}

exports.createSession = createSession
