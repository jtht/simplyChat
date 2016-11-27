var express = require('express');
var router = express.Router();
var DBHelper = require('../db/DBHelper')

var validation = require('../validation');

router.get('/', validation.logoutUser);
router.get('/', function (req, res, next) {
  console.log(req.cookies.sessionID);
  validation.userLoggedIn(req.cookies, function (row) {
    var username = row.name;
    var dbHelper = new DBHelper();
    dbHelper.chatroomsOfUser(username, function (err, result) {
      var rows = result.rows;
      var oRows = [];
      var uRows = [];
      for (row of rows) {
        if (row.chatuser === row.chatroom_owner) oRows.push(row);
        else uRows.push(row);
      }

      function cmp(a, b) {
        if (a.chatroom < b.chatroom) return -1;
        if (a.chatroom > b.chatroom) return 1;
        return 0;
      }

      oRows.sort(cmp);
      uRows.sort(cmp);
      rows = oRows.concat(uRows);
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
    if (crName) {
      response.name = crName;
      if (crName.length < 3) {
        response.status = 'Heiti of stutt (minnst 3)';
        res.json(response);
      } else if (crName.length > 18) {
        response.status = 'Heiti of langt (mest 18)'
        res.json(response);
      } else {
        dbHelper.chatroomsOfOwner(owner, function (err, result) {
          var rows = result.rows;
          var chatroom = rows.find( o => o.name === crName)
          if (!chatroom) {
            response.status = "";
            response.owner = owner;
            var newChatroom = {
              name: crName,
              owner: owner
            };
            dbHelper.insertChatroom(newChatroom);
          } else {
            response.status = "Heiti í notkun"
          }
          res.json(response);
        });
      }
    } else {
      // Bætir notanda við spjallherbergi
      var chatroomOwner = req.body.owner;
      var chatroomName = req.body.chatroom;
      var userToAdd = req.body.user;

      if (chatroomOwner !== owner) {
        response.status = 'Heiti of stutt (minnst 3)';
        res.json(response);
        return;
      }

      dbHelper.userByName(userToAdd, function (err, result) {
        var row = result.rows[0];
        if (!row) {
          response.status = "notandi ekki til";
          res.json(response);
        } else {
          dbHelper.chatroomsOfOwner(owner, function (err, result) {
            var rows = result.rows;
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
