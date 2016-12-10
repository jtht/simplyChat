var url = require('url')

var params = url.parse(process.env.DATABASE_URL);
var auth = params.auth.split(':');

module.exports = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true,
  max: 20,
  min: 4,
  idleTimeoutMillis: 1000
};
