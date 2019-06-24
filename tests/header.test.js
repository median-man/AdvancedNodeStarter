const Page = require('./helpers/page')
const { createUser } = require('./factories/user')

let page

// initialize browser, page, and navigate to app
beforeEach(async () => {
  page = await Page.create()
  await page.goto('localhost:3000')
})

// close browser
afterEach(async () => {
  await page.close()
})

test('header has Blogster brand', async () => {
  // select element and return some content from the page
  const text = await page.getContentsOf('a.brand-logo')
  expect(text).toEqual('Blogster')
})

test('header log in navigates to google oath signin page', async () => {
  await page.click('.right a')
  expect(page.url()).toMatch(/accounts\.google\.com/)
})

test('shows logout button when signed in', async () => {
  // mongo document id from test database, User collection
  //  for test user account
  const user = await createUser()
  await page.login(user)

  const logoutUrl = '/auth/logout'
  const querySelector = `a[href="${logoutUrl}"]`
  const expectedText = 'Logout'

  await page.waitFor(querySelector)

  const text = await page.getContentsOf(querySelector)
  expect(text).toEqual(expectedText)
})
