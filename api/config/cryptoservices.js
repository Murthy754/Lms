var crypto = require('crypto');
var values=require('./values')
var cryptokey =values.values.CRYPTOKEY;
module.exports = {
    encrypt: function (text) {
        var cipher = crypto.createCipher('aes-256-ctr', cryptokey)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    },

    decrypt: function (text) {
        var decipher = crypto.createDecipher('aes-256-ctr', cryptokey)
        var dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    }
};