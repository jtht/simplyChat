var pg = require('pg');

var TABLE_USER = "chatuser";
var TABLE_CHAT_MESSAGE = "chatmessage";
var TABLE_CHAT_ROOM = "chatroom"
var TABLE_USER_CHAT_ROOM = "chatuserchatroom";

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
  user: 'johannesthorkell', //env var: PGUSER
  database: 'puppies',
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 1000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

function DBHelper() {}

handleErr = function (err) {
  if (err) console.log(err.message, err.stack);
}

DBHelper.prototype.insertMessage = function (msg) {
  pool.query("insert into " + TABLE_CHAT_MESSAGE + " values ($1, $2, $3, $4)",
         [msg.content, msg.owner, msg.chatroom, msg.chatroom_owner], handleErr);
}

DBHelper.prototype.insertUser = function (user) {
  pool.query("insert into " + TABLE_USER + " values ($1, $2, $3, $4)",
         [user.name, user.email, user.passwordHash, user.sessionID], handleErr);
}

DBHelper.prototype.updateSessionID = function (username, sessionID) {
  pool.query("update " + TABLE_USER + " set sessionID = $1 where name = $2",
         [sessionID, username], handleErr);
}

DBHelper.prototype.clearSessionID = function (sessionID) {
  pool.query("update " + TABLE_USER + " set sessionID = '' where sessionID = $1",
         [sessionID], handleErr);
}

DBHelper.prototype.insertChatroom = function (chatroom) {
  pool.connect( function (err, client, release) {
    if (err) return release(err);

    client.query("insert into " + TABLE_CHAT_ROOM + " values ($1, $2)",
               [chatroom.name, chatroom.owner], handleErr);

    client.query("insert into " + TABLE_USER_CHAT_ROOM + " values ($2, $1, $2)",
                [chatroom.name, chatroom.owner], function (err) {
                  handleErr(err);
                  release();
                });
  });
}

DBHelper.prototype.connectUserChatroom = function (data) {
  pool.query("insert into " + TABLE_USER_CHAT_ROOM + " values ($1, $2, $3)",
         [data.user, data.chatroom, data.chatroom_owner], handleErr);
 }

DBHelper.prototype.usersOfChatroom = function (chatroom, chatroom_owner, callback) {
  pool.query("select user from " + TABLE_USER_CHAT_ROOM + " where " +
             "chatroom = $1 and chatroom_owner = $2",
             [chatroom, chatroom_owner], callback);
}

DBHelper.prototype.messagesOfChatroom = function (chatroom, chatroom_owner, callback) {
  pool.query("select content, owner from " + TABLE_CHAT_MESSAGE + " where " +
             "chatroom=(?) and chatroom_owner= (?)",
             [chatroom, chatroom_owner], callback);
};

DBHelper.prototype.chatroomsOfOwner = function (owner, callback) {
  pool.query("select name from " + TABLE_CHAT_ROOM + " where owner = $1",
             [owner], callback);
};

DBHelper.prototype.chatroomsOfUser = function (username, callback) {
  pool.query("select * from " + TABLE_USER_CHAT_ROOM + " where user = $1",
             [username], callback);
};

DBHelper.prototype.userByName = function (name, callback) {
  pool.query('select * from ' + TABLE_USER + ' where name = $1',
             [name], callback);
};

DBHelper.prototype.userByEmail = function (email, callback) {
  pool.query('select * from ' + TABLE_USER + ' where email = $1',
             [email], callback);
};

DBHelper.prototype.userBySessionID = function (sessionID, callback) {
  pool.query('select * from ' + TABLE_USER + ' where sessionID = $1',
             [sessionID], callback);
};
