'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');

var AuthService = require('../services/auth-token-service');
var ErrorService = require('../services/error-service');

var auth = require('basic-auth');
var config = require('../config/values');

var redis = require('../config/redis').redis;
var redisClient = require('../config/redis').redisClient;

var requiresLogin = (req, res, next) => {
    AuthService.checkTokenInRedis(req.params.id, req.headers['x-header-authtoken'])
        .then((redisdata) => {
            return AuthService.verifyToken(req.headers['x-header-authtoken'])
        }).then((payload) => {
            req.user = payload;
            return null;
        }).catch((err) => {
            if (err.name === 'TokenExpiredError') {
                return AuthService.verifyRefreshToken(req.headers.refreshtoken)
            }
            throw err;
        }).then((payload) => {
            if (!payload) {
                next();
            } else {
                req.user = payload;
                var tokens = {};
                tokens.authToken = AuthService.createToken(payload);
                tokens.refreshToken = AuthService.createRefreshToken(payload);

                //deleting old tokens from redis
                AuthService.deleteTokenFromRedis(req.headers['x-header-authtoken']);

                //storing tokens in redis with "authToken" as key and [userId , refreshToken] as value
                redisClient.hmset(tokens.authToken, "userId", req.user._id.toString(), "refreshToken", tokens.refreshToken, redis.print);

                res.tokens = tokens;
                next();
            }
        }).catch((err) => {
            console.log(err);
            next();
            // ErrorService.error(ErrorService.customError('UNAUTHORISED'), req, res);
        })
};

var checkLogin = (req, res, next) => {
    var authToken = req.headers['x-header-authtoken'];
    var refreshToken = req.headers['x-header-refreshtoken'];
    if (!authToken || !refreshToken) {
        let err = new Error('invalid token');
        err.status = 401;
        throw err;
    } else {
        AuthService.checkTokenInRedis(authToken, refreshToken)
            .then((data) => {
                return AuthService.verifyToken(data)
            }).then((payload) => {
                return payload;
            }).then((payload) => {
                if (!payload) {
                    next();
                } else {
                    let tokens = {};
                    let id = payload.id;
                    tokens.authToken = AuthService.createToken(payload);
                    tokens.refreshToken = AuthService.createRefreshToken(payload);
                    tokens.jwtToken = AuthService.createToken(payload);

                    //deleting old tokens from redis
                    AuthService.deleteTokenFromRedis(req.headers['x-header-authtoken']);

                    //storing tokens in redis with "authToken" as key and [userId , refreshToken] as value
                    redisClient.hmset(tokens.authToken, "userId", id, "refreshToken", tokens.refreshToken, "jwtToken", tokens.jwtToken, redis.print);

                    res.tokens = tokens;

                    next();
                }
            }).catch((error) => {
                return res.status(401).send({error: error, name: "UnauthorizedError"});
            })
    }
};

var requiresAdminLogin = (req, res, next) => {
    const authToken = req.headers['x-header-authtoken'];
    if (!authToken) {
        let err = new Error('Invalid token');
        err.status = 401;
        throw err;
    } else {
        return AuthService.verifyToken(authToken)
            .then((payload) => {
                // Verifying the Auth token and passing the payload data.
                return payload;
            })
            .then((payload) => {
                req.user = payload.id;
                return req;
            }).then((req) => {
                return AuthService.checkAuthTokenInRedis(authToken, req.user)
            }).then((result) => {
                /*
                Check if OLD tokens are present in redis.
                If yes, create NEW and remove the OLD.
                */
                if (_.includes(result, authToken)) {
                    let user = {
                        id: req.user,
                        role: "admin"
                    }
                    let tokens = {};
                    tokens.authToken = AuthService.createToken(user);

                    //deleting old tokens from redis
                    AuthService.deleteTokenFromRedis(req.headers['x-header-authtoken']);

                    //storing tokens in redis with "authToken" as key and [userId , refreshToken] as value
                    redisClient.hmset(tokens.authToken, "userId", user.id.toString(), "jwtToken", tokens.authToken, "role", user.role, redis.print);

                    res.tokens = tokens;

                    return true;
                } else {
                    let err = "Unauthorized";
                    throw err;
                }
            }).then(() => {
                delete req.headers['x-header-authtoken'];
                next();
            }).catch((error) => {
                res.status(401).json({
                    success: false,
                    error: error
                });
            });
    }
}

exports.requiresLogin = requiresLogin;
exports.checkLogin = checkLogin;
exports.requiresAdminLogin = requiresAdminLogin;
