'use strict';
const DBHelper = require('./db/DBHelper');
const security = require('./security');

class User {
  constructor(info) {
    this.name = info.username.toLowerCase();
    this.email = info.email;
    this.passwordHash = security.encryptPassword(info.password);
    this.sessionID = info.sessionID;
    this.dbHelper = new DBHelper();
  }

  addUserToDB() {
    this.dbHelper.insertUser(this);
  }
}

module.exports = User;
