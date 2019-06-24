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

describe('when logged in', () => {
  beforeEach(async () => {
    const user = await createUser()
    await page.login(user)
    await page.click('a[href="/blogs/new"]')
  })

  test('can see create blog form', async () => {
    await page.waitFor('input[name="title"]')
  })

  describe('using invalid inputs', () => {
    test('form shows error messages', async () => {
      await page.click('form button[type="submit"]')

      const titleError = await page.getContentsOf('.title .red-text')
      expect(titleError).toEqual('You must provide a value')

      const contentError = await page.getContentsOf('.content .red-text')
      expect(contentError).toEqual('You must provide a value')
    })
  })
})
