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

  describe('using valid inputs', () => {
    const FAKE_BLOG = Object.freeze({
      title: 'Test',
      content: 'Test blog content.'
    })

    beforeEach(async () => {
      await page.type('.title input', FAKE_BLOG.title)
      await page.type('.content input', FAKE_BLOG.content)
      await page.click('form button[type="submit"]')
    })

    test('submit navigates to review screen', async () => {
      const reviewTitleText = await page.getContentsOf('form h5')
      expect(reviewTitleText).toEqual('Please confirm your entries')
    })

    test('new blog is added to "My Blogs" screen', async () => {
      const reviewTitleText = await page.getContentsOf('form h5')
      expect(reviewTitleText).toEqual('Please confirm your entries')

      // click on save blog button
      await page.click('form button.green')

      // There is only one blog entry because a new user is created for
      // each test
      const titleSelector = '.card-title'
      await page.waitFor(titleSelector)
      const newBlogEntry = {
        title: await page.getContentsOf(titleSelector),
        content: await page.getContentsOf('.card-content p')
      }
      expect(newBlogEntry).toMatchObject(FAKE_BLOG)
    })
  })
})
