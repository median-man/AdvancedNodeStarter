const puppeteer = require('puppeteer')
const { createSession } = require("./factories/session");


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

test.only('shows logout button when signed in', async () => {
  // mongo document id from test database, User collection
  //  for test user account
  const testUserId = '5d00eeab903b183b30b71fcd'
  const { session, sig } = createSession(testUserId);
  await page.setCookie({
    name: 'session',
    value: session
  }, {
    name: 'session.sig',
    value: sig
  })
  await page.goto('localhost:3000')

  const logoutUrl = '/auth/logout'
  const querySelector = `a[href="${logoutUrl}"]`
  const expectedText = 'Logout'

  await page.waitFor(querySelector)

  const text = await page.$eval(querySelector, el => el.textContent)
  expect(text).toEqual(expectedText)
})

