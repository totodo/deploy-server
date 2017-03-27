const express       = require("express");
const app           = express();
const bodyParse     = require("body-parser");
const port          = process.env.DEPLOY_PORT || 5000;
const redis         = require("redis");
const client        = redis.createClient();
const REDIS_CHANNEL = process.env.REDIS_CHANNEL || 'deploy';

app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());

app.post('/deploy', (req, res) => {
  const body = req.body;
  client.publish(REDIS_CHANNEL, JSON.stringify(body));
  return res.sendStatus(200);
});

app.get('/ping', (req, res) => res.json({msg: 'pong'}));

app.set('port', port);
app.listen(app.get('port'), () => {
  console.log('deploy server listening on ', app.get('port'));
});

require("./sub");