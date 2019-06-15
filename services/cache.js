const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const REDIS_URI = 'redis://127.0.0.1:6379'

const createRedisClient = () => {
  const client = redis.createClient(REDIS_URI)
  client.get = util.promisify(client.get)
  client.hget = util.promisify(client.hget)
  client.set = util.promisify(client.set)
  client.hset = util.promisify(client.hset)
  return client
}
const { exec } = mongoose.Query.prototype

mongoose.Query.prototype.cache = async function(options = {}) {
  this._useCache = true
  this._cacheKey = JSON.stringify(options.key)
  return this
}

mongoose.Query.prototype.exec = async function() {
  if (!this._useCache) {
    return exec.apply(this, arguments)
  }
  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  })

  // check the cache for the key
  const client = createRedisClient()

  const cacheValue = await client.hget(this._cacheKey, key)
  if (cacheValue) {
    const doc = JSON.parse(cacheValue)
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)
  }

  const queryResult = await exec.apply(this, arguments)
  client.hset(this._cacheKey, key, JSON.stringify(queryResult), 'EX', 10)
  return queryResult
}
