var express = require('express');
var router = express.Router();
var DBHelper = require('../db/DBHelper')

var validation = require('../validation');

router.get('/', validation.logoutUser);
router.get('/', function (req, res, next) {
  validation.userLoggedIn(req.cookies, function (row) {
    var username = row.name;
    var dbHelper = new DBHelper();
    dbHelper.chatroomsOfUser(username, function (err, rows) {
      res.render('chat', {rows: rows});
    });
  }, next);
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Simply Chat' });
});

router.post('/', function (req, res, next) {
  // passar að notandi sé loggaður inn
  validation.userLoggedIn(req.cookies, function (row) {
    var owner = row.name
    var dbHelper = new DBHelper();
    var response = {};

    // Býr til nýtt spjallherbergi ef svo ber við
    var crName = req.body.newChatroomname;
    if (crName && crName.length > 3 && crName.length <= 18) {
      var shouldMakeCr = req.body.makeNewChatroom;
      response.name = crName;

      dbHelper.chatroomsOfOwner(owner, function (err, rows) {
        var chatroom = rows.find( o => o.name === crName)
        if (!chatroom) {
          if (shouldMakeCr) {
            response.status = "chatroom created";
            response.owner = owner;
            var newChatroom = {
              name: crName,
              owner: owner
            };
            dbHelper.insertChatroom(newChatroom);
          } else {
            response.status = "name ok";
          }
        } else {
          response.status = "name in use"
        }
        res.json(response);
      });
    } else {
      // Bætir notanda við spjallherbergi
      var chatroomOwner = req.body.owner;
      var chatroomName = req.body.chatroom;
      var userToAdd = req.body.user;

      if (chatroomOwner !== owner) {
        response.status = 'Einhver er að reyna að hakka!';
        res.json(response);
        return;
      }

      dbHelper.userByName(userToAdd, function (err, row) {
        if (!row) {
          response.status = "notandi ekki til";
          res.json(response);
        } else {
          dbHelper.chatroomsOfOwner(owner, function (err, rows) {
            var chatroom = rows.find( o => o.name === chatroomName);
            if (chatroom) {
              var data = {};
              data.user = userToAdd;
              data.chatroom = chatroomName;
              data.chatroom_owner = chatroomOwner;
              dbHelper.connectUserChatroom(data);

              response.status = "notanda bætt við"
            } else {
              response.status = "spjallherbergi ekki til"
            }
            res.json(response);
          });
        }
      });
    }
  }, next);
});

router.post('/', function (req, res, next) {
  validation.verifyUser(req.body, res);
});

module.exports = router;
