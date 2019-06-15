const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const REDIS_URI = 'redis://127.0.0.1:6379'

const createRedisClient = () => {
  const client = redis.createClient(REDIS_URI)
  client.hget = util.promisify(client.hget)
  client.hset = util.promisify(client.hset)
  return client
}

 // check the cache for the key
 const client = createRedisClient()

const { exec } = mongoose.Query.prototype

const DEFAULT_CACHE_OPTIONS = Object.freeze({
  key: 'default'
})

mongoose.Query.prototype.cache = async function(options = {}) {
  this._useCache = true
  this._cacheKey = JSON.stringify(options.key || DEFAULT_CACHE_OPTIONS.key)
  return this
}

mongoose.Query.prototype.exec = async function() {
  if (!this._useCache) {
    return exec.apply(this, arguments)
  }
  const cacheField = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  })

 

  const cacheValue = await client.hget(this._cacheKey, cacheField)
  if (cacheValue) {
    const doc = JSON.parse(cacheValue)
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)
  }

  const queryResult = await exec.apply(this, arguments)
  client.hset(this._cacheKey, cacheField, JSON.stringify(queryResult))
  client.expire(this._cacheKey, 10)
  return queryResult  
}

exports.clearHash = (hashKey) => {
  client.del(JSON.stringify(hashKey))
}
