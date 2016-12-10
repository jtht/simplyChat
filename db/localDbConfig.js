// local stillingar
module.exports = {
  user: 'johannesthorkell', //env var: PGUSER
  database: 'puppies',
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 1000, // how long a client is allowed to remain idle before being closed
};
