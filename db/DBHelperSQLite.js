var sqlite3 = require('sqlite3').verbose();
var _DB_NAME = 'simplyChat.db';
var _TABLE_USER = "User";
var _TABLE_CHAT_MESSAGE = "ChatMessage";
var _TABLE_CHAT_ROOM = "ChatRoom"
var _TABLE_USER_CHAT_ROOM = "UserChatRoom";

function _getDB() {
  // Tímabundið function fyrir development.
  var db = new sqlite3.Database(_DB_NAME);

  // TODO: Bæta við indexum í töflur eftir því hvernig fyrirspurnum
  // verður háttað, not null, unique etc.
  db.serialize(function () {
    db.run("create table if not exists " + _TABLE_USER + "(\n" +
             "\tname text primary key,\n" +
             "\temail text,\n" +
             "\tpasswordHash text,\n" +
             "\tsessionID text\n" +
           ");");

    db.run("create table if not exists " + _TABLE_CHAT_ROOM + "(\n" +
             "\tname text,\n" +
             "\towner text,\n" +
             "\tprimary key (name, owner),\n" +
             "\tforeign key(owner) references " + _TABLE_USER + "(name)\n" +
           ");");

    db.run("create table if not exists " + _TABLE_CHAT_MESSAGE + "(\n" +
             "\tcontent text,\n" +
             "\towner text,\n" +
             "\tchatroom text,\n" +
             "\tchatroom_owner text,\n" +
             "\tforeign key(owner) references " + _TABLE_USER + "(name),\n" +
             "\tforeign key(chatroom, chatroom_owner) references " + _TABLE_CHAT_ROOM + "(name, owner)\n" +
           ");");

    db.run("create table if not exists " + _TABLE_USER_CHAT_ROOM + "(\n" +
             "\tuser text,\n" +
             "\tchatroom text,\n" +
             "\tchatroom_owner text,\n" +
             "\tprimary key (user, chatroom, chatroom_owner),\n" +
             "\tforeign key(user) references " + _TABLE_USER + "(name),\n" +
             "\tforeign key(chatroom, chatroom_owner) references " + _TABLE_CHAT_ROOM + "(name, owner)\n" +
           ");");
  });

  return db;
}

function DBHelper() {}

DBHelper.prototype.insertMessage = function (msg) {
  var db = _getDB();
  db.run("insert into " + _TABLE_CHAT_MESSAGE + " values ((?), (?), (?), (?))",
         msg.content, msg.owner, msg.chatroom, msg.chatroom_owner);
  db.close();
}

DBHelper.prototype.insertUser = function (user) {
  var db = _getDB();
  db.run("insert into " + _TABLE_USER + " values ((?), (?), (?), (?))",
         user.name, user.email, user.passwordHash, user.sessionID);
  db.close();
}

DBHelper.prototype.updateSessionID = function (username, sessionID) {
  var db = _getDB();
  db.run("update " + _TABLE_USER + " set sessionID = (?) where name = (?)",
         sessionID, username);
  db.close();
};

DBHelper.prototype.clearSessionID = function (sessionID) {
  var db = _getDB();
  db.run("update " + _TABLE_USER + " set sessionID = '' where sessionID = (?)",
         sessionID);
  db.close();
}

DBHelper.prototype.insertChatroom = function (chatroom) {
  var db = _getDB();
  db.serialize(function () {
    db.run("insert into " + _TABLE_CHAT_ROOM + " values ((?), (?))",
           chatroom.name, chatroom.owner);

    db.run("insert into " + _TABLE_USER_CHAT_ROOM + " values ((?), (?), (?))",
           chatroom.owner, chatroom.name, chatroom.owner);
  });
  db.close();
}

DBHelper.prototype.connectUserChatroom = function (data) {
  var db = _getDB();
  db.run("insert into " + _TABLE_USER_CHAT_ROOM + " values ((?), (?), (?))",
         data.user, data.chatroom, data.chatroom_owner, function (err) {
           console.log(err.code);
         });
  db.close();
}

DBHelper.prototype.usersOfChatroom = function (chatroom, chatroom_owner, callback) {
  var db = _getDB();
  db.all("select user from " + _TABLE_USER_CHAT_ROOM + " where" +
         " chatroom = (?) and chatroom_owner = (?)",
         chatroom, chatroom_owner, callback);
  db.close();
}

// klára breytingar
DBHelper.prototype.messagesOfChatroom = function (chatroom, chatroom_owner, callback) {
  var db = _getDB();
  db.all("select content, owner from " + _TABLE_CHAT_MESSAGE + " where" +
         " chatroom=(?) and chatroom_owner= (?)", chatroom, chatroom_owner, callback);
  db.close();
};

DBHelper.prototype.chatroomsOfOwner = function (owner, callback) {
  var db = _getDB();
  db.all("select name from " + _TABLE_CHAT_ROOM + " where owner = (?)",
         owner, callback);
  db.close();
};

DBHelper.prototype.chatroomsOfUser = function (username, callback) {
  var db = _getDB();
  db.all("select * from " + _TABLE_USER_CHAT_ROOM + " where user = (?)",
         username, callback);
  db.close();
};

DBHelper.prototype.userByName = function (name, callback) {
  var db = _getDB();
  db.get('select * from ' + _TABLE_USER + ' where name = (?)',
         name, callback);
  db.close();
};

DBHelper.prototype.userByEmail = function (email, callback) {
  var db = _getDB();
  db.get('select * from ' + _TABLE_USER + ' where email = (?)',
         email, callback);
  db.close();
};

DBHelper.prototype.userBySessionID = function (sessionID, callback) {
  var db = _getDB();
  db.get('select * from ' + _TABLE_USER + ' where sessionID = (?)',
         sessionID, callback);
  db.close();
};

/**
 * Setur plat gögn í db svo hægt sé að testa forritið
 * Tímabundið fall fyrir development.
 */
function _populateDummyData() {
  var dummyMessageList = [
    {content: "Hi morty", owner: "rick", chatroom: 1, chatroom_owner: 'rick'},
    {content: "Hey rick", owner: "morty", chatroom: 1, chatroom_owner: 'rick'},
    {content: "How's it going?", owner: "rick", chatroom: 1, chatroom_owner: 'rick'},
    {content: "Not bad", owner: "morty", chatroom: 1, chatroom_owner: 'rick'},

    {content: "I don't know what we're doing anymore jerry", owner: "beth", chatroom: 2, chatroom_owner: 'beth'},
    {content: "But beth I still love you", owner: "jerry", chatroom: 2, chatroom_owner: 'beth'},
    {content: "I don't know how I feel", owner: "beth", chatroom: 2, chatroom_owner: 'beth'},
    {content: "...", owner: "jerry", chatroom: 2, chatroom_owner: 'beth'}
  ];

  var dummyUserList = [
    {name: "rick", email: "rick@sanchez.com", password: "-", sessionID: "-"},
    {name: "morty", email: "morty@smith.com", password: "-", sessionID: "-"},
    {name: "beth", email: "beth@smith.com", password: "-", sessionID: "-"},
    {name: "jerry", email: "jerry@smith.com", password: "-", sessionID: "-"}
  ];

  var dummyChatroomList = [
    {name: 1, owner: "rick"},
    {name: 2, owner: "beth"}
  ];

  var db = _getDB();

  db.serialize(function () {
    var stmt = db.prepare('insert into ' + _TABLE_USER + ' values ((?), (?), (?), (?))');
    dummyUserList.forEach(function (user) {
      stmt.run(user.name, user.email, user.password, user.sessionID);
    });

    stmt = db.prepare("insert into " + _TABLE_CHAT_MESSAGE + " values ((?), (?), (?), (?))");
    dummyMessageList.forEach(function (msg) {
      stmt.run(msg.content, msg.owner, msg.chatroom, msg.chatroom_owner);
    });

    var chatrooms = dummyChatroomList;
    db.run("insert into " + _TABLE_CHAT_ROOM + " values ((?), (?))",
           chatrooms[0].name, chatrooms[0].owner);

    db.run("insert into " + _TABLE_USER_CHAT_ROOM + " values ((?), (?), (?))",
           chatrooms[0].owner, chatrooms[0].name, chatrooms[0].owner);

    db.run("insert into " + _TABLE_CHAT_ROOM + " values ((?), (?))",
           chatrooms[1].name, chatrooms[1].owner);

    db.run("insert into " + _TABLE_USER_CHAT_ROOM + " values ((?), (?), (?))",
           chatrooms[1].owner, chatrooms[1].name, chatrooms[1].owner);

    db.run("insert into " + _TABLE_USER_CHAT_ROOM + " values ((?), (?), (?))",
           "morty", 1, chatrooms[0].owner);

    db.run("insert into " + _TABLE_USER_CHAT_ROOM + " values ((?), (?), (?))",
           "jerry", 2, chatrooms[1].owner);
  });
}

// _populateDummyData();
module.exports = DBHelper;
