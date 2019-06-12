const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const REDIS_URL = 'redis://127.0.0.1:6379'
    const redis = require('redis')
    const { promisify } = require('util')
    const redisClient = redis.createClient(REDIS_URL)
    
    // change interface to use promises
    redisClient.get = util.promisify(client.get)

    // check for cached data
    const cachedBlogs = await redisClient.get(req.user.id)

    // TODO
    // finish implementing caching logic for this route

    // if cached, respond right away

    // if not cached, query and update cache

    // send response
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id });

    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
