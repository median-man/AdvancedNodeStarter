const puppeteer = require('puppeteer')
const { createSession } = require('../factories/session')

class Page {
  static async create() {
    const browser = await puppeteer.launch({ headless: false })
    const basePage = await browser.newPage()
    const page = new Page(basePage)

    return new Proxy(page, {
      get: function(target, property) {
        return target[property] || browser[property] || basePage[property]
      }
    })
  }

  constructor(page) {
    this.page = page
  }

  async login(user) {
    const { session, sig } = createSession(user)
    await this.page.setCookie(
      {
        name: 'session',
        value: session
      },
      {
        name: 'session.sig',
        value: sig
      }
    )
    await this.page.goto('localhost:3000')
  }
}

module.exports = Page
