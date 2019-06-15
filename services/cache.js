const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const REDIS_URI = 'redis://127.0.0.1:6379'

const createRedisClient = () => {
  const client = redis.createClient(REDIS_URI)
  client.get = util.promisify(client.get)
  client.set = util.promisify(client.set)
  return client
}
const { exec } = mongoose.Query.prototype

mongoose.Query.prototype.cache = async function() {
  this._useCache = true
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
  console.log('cache: EXECUTING QUERY', key)

  // check the cache for the key
  const client = createRedisClient()

  const cacheValue = await client.get(key)
  if (cacheValue) {
    console.log('cache: RETURNING CACHE VALUE', cacheValue)
    const doc = JSON.parse(cacheValue)
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)
  }

  const queryResult = await exec.apply(this, arguments)
  console.log('cache: RETURNING MONGO QUERY RESULT', queryResult)
  client.set(key, JSON.stringify(queryResult))
  return queryResult
}
