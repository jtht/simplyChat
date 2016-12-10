/**
 * Websocket server appsins
 */
const cookie = require('cookie');
const WebSocketServer = require('ws').Server;
const userLoggedIn = require('../model/validation').userLoggedIn;
const DBHelper = require('../db/DBHelper');

exports.initWebSocketServer = function(server) {
  var wss = new WebSocketServer({ server: server });
  // object sem heldur utan um notendur sem eru með lifandi tengingu
  // við serverinn og hvaða spjallherbergi eru tengdir við. Notað til
  // að senda þeim skilaboð jafnóðum og þau berast
  var ACTIVE_USERS = {};
  var dbHelper = new DBHelper();

  wss.on('connection', function (ws) {
    console.log('notandi tengdur...');

    ws.on('message', function (data) {
      var msg = JSON.parse(data);
      userLoggedIn(msg, function (user) {
        var cr = msg.chatroom;
        var crOwner = msg.chatroom_owner;
        // Höndlar tilfellið þegar notandi tengist við spjallherbergi.
        // Þá þarf að senda honum öll skilaboð herbergisins úr gagnagrunni
        if (msg.newConnection) {
          ws.user = user.name;
          var activeUserInfo = {
            socket: ws,
            crInfo: {cr: cr, crOwner: crOwner}
          };
          ACTIVE_USERS[user.name] = activeUserInfo;
          dbHelper.messagesOfChatroom(cr, crOwner, function (err, result) {
            var rows = result.rows;
            rows.forEach(function (row) {
              console.log(row);
              var reply = {
                sender: row.sender,
                recipient: user.name,
                content: row.content,
                date: row.date_of_send,
                gravatar: row.gravatar
              }
              ws.send(JSON.stringify(reply));
            });
          });
        } else {
          // Höndlar tilfellið þar sem notandi sendir skilaboð. Þá þarf að
          // skrifa þau í gagnagrunn og senda til allra notanda sem eru tengdir
          // við spjallherbergið
          msg.sender = user.name;
          dbHelper.insertMessage(msg);

          dbHelper.usersOfChatroom(cr, crOwner, function (err, result) {
            var rows = result.rows;
            rows.forEach(function (row) {
              var client = ACTIVE_USERS[row.chatuser];
              if (client) {
                var inChatroom = client.crInfo.cr === cr && client.crInfo.crOwner === crOwner;
                if (inChatroom) {
                  var reply = {
                    sender: user.name,
                    recipient: row.chatuser,
                    content: msg.content,
                    date: msg.date,
                    gravatar: user.gravatar
                  }
                  client.socket.send(JSON.stringify(reply));
                }
              }
            });
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
