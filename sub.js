const redis         = require("redis");
const client        = redis.createClient();
const REDIS_CHANNEL = process.env.REDIS_CHANNEL || 'deploy';
const rebuild       = require("./rebuild");

client.on('message', (channel, body) => {
  rebuild(JSON.parse(body));
});

client.subscribe(REDIS_CHANNEL);