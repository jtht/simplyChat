/**
 * User þjónar bara þeim tilgangi að koma upplýsingum um notanda
 * á það format sem gagnagrunnur vill og hann býður svo upp á method
 * til að bæta notandanum við gagnagrunninn
 */
'use strict';
const gravatar = require('gravatar');

const DBHelper = require('../db/DBHelper');
const security = require('./security');

var GRAVATAR_CONFIG = {s: '40', r: 'pg', d: 'retro'};

class User {
  constructor(info) {
    this.name = info.username.toLowerCase();
    this.email = info.email;
    this.passwordHash = security.encryptPassword(info.password);
    this.sessionID = info.sessionID;
    this.gravatar = gravatar.url(info.email, GRAVATAR_CONFIG, true);
    this.dbHelper = new DBHelper();
  }

  addUserToDB() {
    this.dbHelper.insertUser(this);
  }
}

module.exports = User;
