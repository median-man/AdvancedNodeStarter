const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const REDIS_URL = 'redis://127.0.0.1:6379'
    const redis = require('redis')
    const util = require('util')
    const redisClient = redis.createClient(REDIS_URL)
    redisClient.monitor(console.log)
    redisClient.get = util.promisify(redisClient.get)
    
    const cachedBlogs = await redisClient.get(req.user.id)
    if (cachedBlogs) {
      console.log('SERVING FROM CACHE', new Date())
      res.send(JSON.parse(cachedBlogs))
      return
    }

    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    console.log('SERVING FROM MONGODB', new Date())
    res.send(blog);
    
    redisClient.set(req.user.id, JSON.stringify(blog))
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
