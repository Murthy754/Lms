var values = require('./values');
var CryptoServices = require('./cryptoservices');
var jwt = require('jsonwebtoken');

// Expiry time
var authTime = values.values.ACCESS_TOKEN_TIME;
var refreshTime = values.values.REFRESH_TOKEN_TIME;

// Secret Keys
var authkey = values.values.ACCESSKEY;
var refreshkey = values.values.REFRESHKEY;
module.exports = {

    newAuthToken: function (userId, userRole) {
        // Encrypt UserId
        var encryptedId = CryptoServices.encrypt(userId);

        // Create Access token
        var authToken = jwt.sign({
            "userId": encryptedId,
            "role": userRole
        }, authkey, {
                expiresIn: authTime
            });
        // Return the generated token
        return authToken;
    },
    newRefreshToken: function (userId) {

        // Encrypt UserId
        var encryptedId = CryptoServices.encrypt(userId);

        // Create Refresh token
        var refreshToken = jwt.sign({
            "userId": encryptedId
        }, refreshkey, {
                expiresIn: refreshTime
            });

        return refreshToken;
    },

};