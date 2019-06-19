const puppeteer = require('puppeteer')
const { Buffer } = require('safe-buffer')
const Keygrip = require('keygrip')
const key = require('../config/keys')

let page, browser

// initialize browser, page, and navigate to app
beforeEach(async () => {
  browser = await puppeteer.launch({ headless: false })
  page = await browser.newPage()
  await page.goto('localhost:3000')
})

// close browser
afterEach(async () => {
  await browser.close()
})

test('header has Blogster brand', async () => {
  // select element and return some content from the page
  const text = await page.$eval('a.brand-logo', el => el.textContent)
  expect(text).toEqual('Blogster')
})

test('header log in navigates to google oath signin page', async () => {
  await page.click('.right a')
  expect(page.url()).toMatch(/accounts\.google\.com/)
})

test('shows logout button when signed in', async () => {
  // mongo document id from test database, User collection
  //  for test user account
  const testUserId = '5d00eeab903b183b30b71fcd'
  const sessionObject = {
    passport: {
      user: testUserId
    }
  }
  const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString(
    'base64'
  )
  const keygrip = new Keygrip([key.cookieKey])
  const sig = keygrip.sign(`session=${sessionString}`)
  const sessionCookie = {
    name: 'session',
    value: sessionString
  }
  const sigCookie = {
    name: 'session.sig',
    value: sig
  }
  await page.setCookie(sessionCookie, sigCookie)
  await page.goto('localhost:3000')

  const logoutUrl = '/auth/logout'
  const querySelector = `a[href="${logoutUrl}"]`
  const expectedText = 'Logout'

  await page.waitFor(querySelector)

  const text = await page.$eval(querySelector, el => el.textContent)
  expect(text).toEqual(expectedText)
})
