var values = require('../config/values');
var bcrypt = require('bcrypt');
module.exports = {

    /* Encrypting A String */
    getEncryptionString: function (password) {        
        bcrypt.genSalt(values.values.SALT_ROUNDS, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                return hash;
            });
        });
    },

    /* Checking Encrpted String and Currect String Same Or Not */
    compareString:function(platinText,encryptedText)
    {
        return bcrypt.compare(platinText, encryptedText); 
    }

};