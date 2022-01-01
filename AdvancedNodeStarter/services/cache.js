const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://0.0.0.0:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

// Apply caching to this query.
mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || ''); // Ensures that we don't end up with 'undefined' hashkey.

    // Return this so that the cache function is chainable.
    return this;
}

// NOTE: We cannot use an arrow function here because it would change the scope of this.
mongoose.Query.prototype.exec = async function() {
    if(!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name,
    }));

    // See if we have a value for 'key' in redis
    const cacheValue = await client.hget(this.hashKey, key);

    // If we do, return that.
    if(cacheValue){

        // Parse the redis string value.
        const doc = JSON.parse(cacheValue);

        // If it's an array we need to parse each element, otherwise just the single entity.
        return Array.isArray(doc) ? doc.map(d => this.model(d)) : new this.model(doc);
    }

    // Otherwise, issue the query and store the result in redis.
    const result = await exec.apply(this, arguments);

    // Set in cache and expire after one hour.
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 3600);

    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}
