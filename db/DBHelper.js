var pg = require('pg');
var config = require('../remoteDbConfig');

var TABLE_USER = "chatuser";
var TABLE_CHAT_MESSAGE = "chatmessage";
var TABLE_CHAT_ROOM = "chatroom"
var TABLE_USER_CHAT_ROOM = "chatuserchatroom";

var pool = new pg.Pool(config);

function DBHelper() {}

handleErr = function (err) {
  if (err) console.log(err.message, err.stack);
}

DBHelper.prototype.insertMessage = function (msg) {
  pool.query("insert into " + TABLE_CHAT_MESSAGE + " values ($1, $2, $3, $4, $5)",
         [msg.content, msg.sender, msg.chatroom, msg.chatroom_owner, msg.date], handleErr);
}

DBHelper.prototype.insertUser = function (user) {
  pool.query("insert into " + TABLE_USER + " values ($1, $2, $3, $4, $5)",
         [user.name, user.email, user.passwordHash, user.sessionID, user.gravatar], handleErr);
}

DBHelper.prototype.updateSessionID = function (username, sessionID, cb) {
  pool.query("update " + TABLE_USER + " set sessionID = $1 where name = $2",
         [sessionID, username], cb);
}

DBHelper.prototype.updateGravatar = function (username, gravatar, cb) {
  pool.query("update " + TABLE_USER + " set gravatar = $1 where name = $2",
         [gravatar, username], cb);
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
  pool.query("select chatuser from " + TABLE_USER_CHAT_ROOM + " where " +
             "chatroom = $1 and chatroom_owner = $2",
             [chatroom, chatroom_owner], callback);
}

DBHelper.prototype.messagesOfChatroom = function (chatroom, chatroom_owner, callback) {
  pool.query("select content, sender, date_of_send, gravatar from " +
             "(select * from chatmessage " + TABLE_CHAT_MESSAGE + " " +
             "where chatroom = $1 and chatroom_owner = $2)t " +
             "join chatuser on t.sender = chatuser.name order by date_of_send",
             [chatroom, chatroom_owner], callback);
};

DBHelper.prototype.chatroomsOfOwner = function (owner, callback) {
  pool.query("select name from " + TABLE_CHAT_ROOM + " where owner = $1",
             [owner], callback);
};

DBHelper.prototype.chatroomsOfUser = function (username, callback) {
  pool.query("select * from " + TABLE_USER_CHAT_ROOM + " where chatuser = $1",
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
module.exports = DBHelper;
