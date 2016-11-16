const cookie = require('cookie');
const WebSocketServer = require('ws').Server;
const userLoggedIn = require('./validation').userLoggedIn;
const DBHelper = require('./db/DBHelper');

exports.initWebSocketServer = function(server) {
  var wss = new WebSocketServer({ server: server });
  var ACTIVE_USERS = {};
  var dbHelper = new DBHelper();

  wss.on('connection', function (ws) {
    console.log('notandi tengdur...');

    ws.on('message', function (data) {
      var msg = JSON.parse(data);
      userLoggedIn(msg, function (user) {
        var cr = msg.chatroom;
        var crOwner = msg.chatroom_owner;
        if (msg.newConnection) {
          ws.user = user.name;
          var activeUserInfo = {
            socket: ws,
            crInfo: {cr: cr, crOwner: crOwner}
          };
          ACTIVE_USERS[user.name] = activeUserInfo;
          dbHelper.messagesOfChatroom(cr, crOwner, function (err, rows) {
            rows.forEach(function (row) {
              var reply = {
                sender: row.owner,
                recipient: user.name,
                content: row.content
              }
              ws.send(JSON.stringify(reply));
            });
          });
        } else {
          msg.owner = user.name;
          dbHelper.insertMessage(msg);

          dbHelper.usersOfChatroom(cr, crOwner, function (err, rows) {
            rows.forEach(function (row) {
              var client = ACTIVE_USERS[row.user];
              if (client) {
                var inChatroom = client.crInfo.cr === cr && client.crInfo.crOwner === crOwner;
                if (inChatroom) {
                  var reply = {
                    sender: user.name,
                    recipient: row.user,
                    content: msg.content
                  }
                  client.socket.send(JSON.stringify(reply));
                }
              }
            })
          });
        }
      }, () => console.log('cbFalse kallað á socket connect!!!'));
    });

    ws.on('close', function (code, message) {
      var user = ws.user;
      delete ACTIVE_USERS[user];
      console.log('var að loka hérna á ' + user);
    });
  });
}
