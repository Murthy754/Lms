
'use strict';

var jwt = require('jsonwebtoken');
var config = require('../config/values');
var crypto = crypto = require('crypto');

var CryptoService = require('../config/cryptoservices');
var redisClient = require('../config/redis').redisClient;

exports.createToken = (user) => {
    //Create a Token and send the response
    var userDetails = {
        _id: CryptoService.encrypt(user.id),
        role: user.role
    };
    var token = jwt.sign(userDetails, config.values.jwtSecret, {
        expiresIn: config.values.authExpiry
    });
    // Token.create()
    return token;
};

exports.createRefreshToken = (user) => {
    //Create a Token and send the response
    var userDetails = {
        _id: CryptoService.encrypt(user.id),
        role: user.role
    };
    var refreshToken = jwt.sign(userDetails, config.values.jwtRefreshSecret, {
        expiresIn: config.values.refreshExpiry
    });
    // Token.create()
    return refreshToken;
};

exports.createZendeskToken = (user) => {
    //Create a Token and send the response
    var userDetails = {
        name: user.full_name,
        email: user.email,
        jti: crypto.randomBytes(32).toString('hex')
    };
    var refreshToken = jwt.sign(userDetails, config.zendeskSecret);
    // Token.create()
    return refreshToken;
};

exports.verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.values.jwtSecret, (err, decoded) => {
            if (err) {
                return reject(err)
            }
            decoded.id = CryptoService.decrypt(decoded._id);
            return resolve(decoded);
        });
    })
}

exports.verifyRefreshToken = (token) => {
    return new Promise((resolve, reject)  => {
        jwt.verify(token, config.values.jwtRefreshSecret, (err, decoded) => {
            if (err) {
                return reject(err)
            }
            decoded._id = CryptoService.decrypt(decoded._id);
            return resolve(decoded);
        });
    })
}

exports.checkTokenInRedis = (authToken, refreshToken) => {
    var error = "invalid token";
    return new Promise((resolve, reject) => {
        redisClient.hgetall(authToken, (err, value) => {
            if (err) {
                return reject(err);
            }
            if (!value) {
                return reject("User not exist");
            } else {
                if (value.refreshToken === refreshToken) {
                    return resolve(value.jwtToken);
                }
                else {
                    return reject(error);
                }
            }
        });
    });
}

exports.checkAuthTokenInRedis = (authToken, id) => {
    var error = "Invalid token";
    return new Promise((resolve, reject) => {
        redisClient.hgetall(authToken, (err, value) => {
            if (err) {
                return reject(err);
            }
            if (!value) {
                return reject("User not exist");
            } else {
                if (value.userId === id) {
                    return resolve(value.jwtToken);
                }
                else {
                    return reject(error);
                }
            }
        });
    });
}

exports.deleteTokenFromRedis = (token) => {
    return new Promise((resolve, reject) => {
        redisClient.del(token, (err, status) => {
            if (err) {
                return reject(err);
            }
            // if (status === 0) {
            //     return reject(new Error("Redis token absent"));
            // }
            return resolve(status)
        })
    });
}
