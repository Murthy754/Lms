/**
 * Created by Jyothi on 3/3/17.
 */

'use strict';

var ErrorService = require('../services/error-service');
var config = require('../../config');
var moment = require('moment');

exports.checkTimestamp = function (req, res, next) {
        var headers = req.headers;
        if (!headers.authorization) {
            ErrorService.error(ErrorService.customError('MISSING_HEADERS'), req, res);
            return;
        }
        var timestamp = new Buffer(headers.authorization, 'base64');
        var requestedTimestamp = moment(timestamp);
        var requiredTimestamp = moment();
        var duration = moment.duration(requiredTimestamp.diff(requestedTimestamp));
        var seconds = duration.asSeconds();

        if(seconds <= 30){
            next();
        }else {
            ErrorService.error(ErrorService.customError('NOTAUTHORIZED'), req, res);
            return;
        }
};
