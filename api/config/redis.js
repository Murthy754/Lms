'use strict'

/** Redis Datastore config **/
var redis = require('redis');

const chalk = require('chalk');

var config = require('../app.js');

var url = config.redis;
var redisClient = redis.createClient(url);

redisClient.on('error', function (err) {
    console.log('Error ' + err);
});

redisClient.on('connect', function () {
    console.log(`${chalk.green('✓')} App is running at ${chalk.cyan('http://localhost:%s')}`, process.env.PORT || 3002);
    console.log(chalk.green('✓'), "Redis Connected");
});

exports.redis = redis;
exports.redisClient = redisClient;

// CONFIG SET protected-mode no
