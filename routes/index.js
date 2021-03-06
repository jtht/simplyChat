/**
 * Bara spjall er einnar síðu app og því er allt routing og öll
 * tilfelli sem koma upp á höndluð hér
 */

var express = require('express');
var router = express.Router();
var DBHelper = require('../db/DBHelper')

var validation = require('../model/validation');

// Fyrsta middleware. Athugar hvort notandi hafi skráð sig út og
// sendir hann þá á frontpage
router.get('/', validation.logoutUser);

// Athugar hvort notandi sé skráður inn og afgreiðir request hans.
// Þegar notandi er loggaður inn og sendir get request fær hann
// skjá með spjallherbergjum sem hann á/er notandi í.
router.get('/', function (req, res, next) {
  validation.userLoggedIn(req.cookies, function (row) {
    var username = row.name;
    var dbHelper = new DBHelper();
    dbHelper.chatroomsOfUser(username, function (err, result) {
      var rows = result.rows;

      // sorterar spjallherbergi notanda þannig að fyrst koma herbergi
      // sem hann á í stafrófsröð og svo herbergi þar sem hann er bara
      // notandi í stafrófsröð
      var oRows = [];
      var uRows = [];
      for (row of rows) {
        if (row.chatuser === row.chatroom_owner) oRows.push(row);
        else uRows.push(row);
      }

      // hægt að gera með flóknar compare function en þetta lá betur
      // við og hefur lægra flækjustig (en ekki lægri keyrsltíma í
      // raunveruleikanum:/)
      function cmp(a, b) {
        if (a.chatroom < b.chatroom) return -1;
        if (a.chatroom > b.chatroom) return 1;
        return 0;
      }

      oRows.sort(cmp);
      uRows.sort(cmp);
      rows = oRows.concat(uRows);

      res.render('chat', {rows: rows, username: username});
    });
  }, next);
});

// Notandi er ekki skráður inn, renderar frontpage
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Bara Spjall' });
});

// Höndlar post request þegar notandi er loggaður inn. Þá er hann
// annaðhvort að búa til spjallherbergi eða að skrá notanda í
// spjallherbergi
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

// Höndlar þegar notandi skráir sig inn eða nýskráir sig
router.post('/', function (req, res, next) {
  validation.verifyUser(req.body, res);
});

module.exports = router;
