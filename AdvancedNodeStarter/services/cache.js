const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://0.0.0.0:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;

// NOTE: We cannot use an arrow function here because it would change the scope of this.
mongoose.Query.prototype.exec = async function() {
    console.log("I'm about to run a query.");

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name,
    }));

    console.log(`Key: ${key}`);

    // See if we have a value for 'key' in redis
    const cacheValue = await client.get(key);

    // If we do, return that.
    if(cacheValue){

        // Parse the redis string value.
        const doc = JSON.parse(cacheVale);

        // If it's an array we need to parse each element, otherwise just the single entity.
        return Array.isArray(doc) ? doc.map(d => this.model(d)) : new this.model(doc);
    }

    // Otherwise, issue the query and store the result in redis.
    const result = await exec.apply(this, arguments);
    client.set(key, JSON.stringify(result));

    console.log(result);

    return result;
}
