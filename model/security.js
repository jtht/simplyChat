/**
 * security.js er með utility föll fyrir öryggis tengd atriði appsins
 * svo sem að hasha lykilorð og búa til session id
 */

const crypto = require('crypto');
// fjöldi bæta í salti
const N_BYTES_SALT = 8;
// fjöldi bæta í session id
const N_BYTES_ID = 16;
// samskeyti hash af lykilorði og salts
const SEPERATOR = ';';

/**
 * Býr til salt sem er nBytes mörg bæti og skilar hex táknun þess
 * @param  {number} nBytes fjöldi bæta í salti, nBytes er heiltala og >= 0
 * @return {string}        hex táknun saltsins
 */
function _makeSalt(nBytes) {
  return crypto.randomBytes(nBytes).toString('hex');
}

/**
 * Hashar lykilorð og salt
 * @param  {string} password        lykilorð sem skal hashað með salt
 * @param  {string} salt            salt sem skal hashað með password
 * @param  {string} [algo='sha512'] hashing reikniritið
 * @return {string}                 hash password og salt
 */
function hashPassword(password, salt, algo) {
  algo = algo || 'sha512';
  var hmac = crypto.createHmac(algo, salt);
  var hash = hmac.update(password).digest('hex').toString();
  return hash;
}

/**
 * Dulkóðar lykilorð með random salti
 * @param  {string} password lykilorð sem skal dulkóða
 * @return {string}          samskeyting dulkóðunnar lykilorðs og
 * saltsins með @SEPERATOR á milli
 */
function encryptPassword(password) {
  var salt = _makeSalt(N_BYTES_SALT);
  var hash = hashPassword(password, salt);
  return hash + SEPERATOR + salt;
}

/**
 * Athugar hvort að lykilorð hashað með ákveðnu salti sé jafnt öðru hashi
 * @param  {string} password    lykilorðið sem skal athuga
 * @param  {string} hashAndSalt samskeyting hash og salt með @SEPERATOR. hash
 * er hashið sem skal athugað hvort password hashað með salt sé jafnt
 * @return {boolean}             satt ef hash password er jafn hash
 */
function checkPassword(password, hashAndSalt) {
  var t = hashAndSalt.split(SEPERATOR);
  var hash = t[0];
  var salt = t[1];
  if (hashPassword(password, salt) === hash) return true;
  else return false
}

/**
 * Býr til session id
 * @return {string}  base64 táknun session id
 */
function makeSessionID() {
  return crypto.randomBytes(N_BYTES_ID).toString('hex');
}

module.exports = {
  hashPassword: hashPassword,
  encryptPassword: encryptPassword,
  checkPassword: checkPassword,
  makeSessionID: makeSessionID
};
