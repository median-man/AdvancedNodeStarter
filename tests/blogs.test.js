const Page = require('./helpers/page')
const { createUser } = require('./factories/user')

let page

beforeEach(async () => {
  page = await Page.create()
  await page.goto('localhost:3000')
})

afterEach(async () => {
  await page.close()
})

test('can see new blog form after clicking new button', async () => {
  const user = await createUser()
  await page.login(user)

  await page.click('a[href="/blogs/new"]')
  await page.waitFor('input[name="title"]')
})
