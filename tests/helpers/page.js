const puppeteer = require('puppeteer')

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
}

module.exports = Page
