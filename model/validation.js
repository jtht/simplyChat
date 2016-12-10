/**
 * validation.js sér um auðkenningu á notendum og að beina þeima á
 * réttar slóðir eftir því hver niðurstaða þess er.
 */

var DBHelper = require('../db/DBHelper');
var security = require('./security');
var User = require('./User');

/**
 * Sannreynir auðkeninngu notanda
 * @param  {object} info upplýsingar um notanda
 * @param  {object} res  response object til clients
 */
function verifyUser(info, res) {
  var response = {};
  var dbHelper = new DBHelper();

  var name = info.username;
  var email = info.email;
  var password = info.password;
  var passwordC = info.passwordConfirmation;
  if (info.type === 'signup') {
    nameError = verifyUsername(name);
    emailError = verifyEmail(email);
    pwError = verifyPassword(password);
    pwcError = verifyPasswordC(password, passwordC);

    response['username'] = nameError;
    response['email'] = emailError;
    response['password'] = pwError;
    response['passwordConfirmation'] = pwcError;
    if (!nameError) {
      dbHelper.userByName(name, function (err, result) {
        if (err) return console.log(err);
        var row = result.rows[0];
        console.log(row);
        if (row) {
          response['username'] = "notandanafn er í notkun";
        }

        if (!emailError) {
          dbHelper.userByEmail(email, function (err, result) {
            var row = result.rows[0];
            if (row) {
              response['email'] = "email í notkun";
            }
            else {
              var userLegal = true;
              Object.keys(response).forEach( function (key) {
                if (response[key]) userLegal = false;
              });
              if (userLegal) {
                createNewUser(res, info);
              }
            }
            res.json(response);
          });
        } else {
          res.json(response);
        }
      });
    } else if (!emailError) {
      dbHelper.userByEmail(email, function (err, result) {
        var row = result.rows[0];
        if (row) {
          response['email'] = "email í notkun";
        }
        res.json(response);
      });
    } else {
      res.json(response);
    }
  } else if (info.type === 'login') {
    dbHelper.userByName(name, function (err, result) {
      var row = result.rows[0];
      if (row && security.checkPassword(info.password, row.passwordhash)) {
        response['password'] = '';
        loginUser(res, dbHelper, row.name, response);
      } else {
        response['password'] = 'rangt lykilorð/notandanafn';
        res.json(response);
      }
    });
  } else {
    response.status = 'error';
    res.json(response);
  }
}

/**
 * Sannreynar að notandanafn sé löglegt
 * @param  {string} name notandanafn
 * @return {string}      tómur strengur ef notandanafn er löglegt
 * annars viðeigandi villuskilaboð
 */
function verifyUsername(name) {
  var error = '';
  if (typeof name !== 'string') {
    error = 'notandanafn er ekki strengur';
  } else if (name.length < 3) {
    error = 'notandanafn of stutt (minnst 3)';
  } else if (name.length > 18) {
    error = 'notandanafn of langt (mest 18)';
  } else if (!/^[A-Za-z0-9\-_]*$/.test(name)) {
    error = 'notandanafn er ólöglegt';
  }
  return error;
}

/**
 * Sannreynar að email sé löglegt
 * @param  {string} email email
 * @return {string}       tómur strengur ef email er löglegt
 * annars viðeigandi villuskilaboð
 */
function verifyEmail(email) {
  var error = '';
  if (typeof email !== 'string') {
    error = 'email er ekki strengur';
  } else if (!/^[^\s@]+@[^\s@\.]+\.[^\s@\.]+$/.test(email)) {
    error = 'email er ólöglegt';
  }
  return error;
}

/**
 * Sannreynar að lykilorð sé löglegt
 * @param  {string} pw lykilorð
 * @return {string}    tómur strengur ef lykilorð er löglegt
 * annars viðeigandi villuskilaboð
 */
function verifyPassword(pw) {
  var error = '';
  if (typeof pw !== 'string') {
    error = 'lykilorð er ekki strengur';
  } else if (pw.length < 8) {
    error = 'lykilorð of stutt (minnst 8)';
  } else if (pw.length > 18) {
    error = 'lykilorð of langt (mest 18)';
  }
  return error;
}

/**
 * Sannreynir að lykilorð og staðfesting þess stemma
 * @param  {string} pw  lykilorð
 * @param  {string} pwc staðfesting pw
 * @return {string}     tómur strengur ef lykilorð stemma
 * annars viðeigandi villuskilaboð
 */
function verifyPasswordC(pw, pwc) {
  var error = '';
  if (pw !== pwc) {
   error = 'lykilorð passa ekki';
 }
 return error;
}

/**
 * Bætir við nýjum notanda í gagnagrunn og skráir hann inn á vefsíðuna
 * @param  {object} res  response object til client
 * @param  {object} info upplýsingar um notanda
 */
function createNewUser(res, info) {
  info.sessionID = setNewSessionID(res);
  var user = new User(info);
  user.addUserToDB();
}

/**
 * Skráir notanda inn á vefsíðuna
 * @param  {object} res      response object til client
 * @param  {object} dbHelper tenging við gagnagrunn
 * @param  {string} username nafn notanda
 */
function loginUser(res, dbHelper, username, response) {
  var sessionID = setNewSessionID(res);
  dbHelper.updateSessionID(username, sessionID, function (err) {
    if (err) console.log(err.message, err.stack);
    else res.json(response);
  });
}

/**
 * Býr til session id og setur cookie fyrir það hjá notanda
 * @param {object} res  response object til client
 */
function setNewSessionID(res) {
  var sessionID = security.makeSessionID();
  res.cookie('sessionID', sessionID, {maxAge: 360000*24*365, path: '/'});
  return sessionID;
}

/**
 * Middleware sem skráir notanda út af vefsíðunni
 * @param  {object}   req  request object til client
 * @param  {object}   res  response object til client
 * @param  {function} next næsta fall í middleware keðju
 */
function logoutUser(req, res, next) {
  if (req.query.logout === 'true') {
    var sessionID = req.cookies.sessionID;
    if (!sessionID) { next(); return; }

    var dbHelper = new DBHelper();
    dbHelper.clearSessionID(sessionID);
    res.clearCookie('sessionID');
    res.redirect('/');
  } else {
    next();
  }
}

/**
 * Middleware sem athugar hvort notandi hafi session id cookie og
 * beinir honum á réttan stað ef svo er
 * @param  {object}   req  request object til client
 * @param  {object}   res  response object til client
 * @param  {function} next næsta fall í middleware keðju
 */
function userLoggedIn(userInfo, cbTrue, cbFalse) {
  var sessionID = userInfo.sessionID;
  if (!sessionID) { cbFalse(); return; }

  var dbHelper = new DBHelper();
  dbHelper.userBySessionID(sessionID, function (err, result) {
    if (err) return console.log(err);
    var row = result.rows[0];
    if (row && row.sessionid && row.sessionid === sessionID) {
      cbTrue(row);
    } else {
      cbFalse();
    }
  });
}

module.exports = {
  verifyUser: verifyUser,
  userLoggedIn: userLoggedIn,
  logoutUser: logoutUser
 };
