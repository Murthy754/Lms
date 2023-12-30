'use strict';

var _ = require('lodash');
var ErrorService = require('../services/error-service');
var config = require('../../config');
var requiredHeaders = config.requiredHeaders;
var additionalHeaders = config.additionalHeaders;
var allHeaders = requiredHeaders.concat(additionalHeaders);

exports.checkHeaders = function (header_type) {
    /**
     * header_type
     *    basic_headers  : required only basic headers
     *    all_headers    : required additional headers along with basic headers
     */

    var headers = (header_type == 'basic_headers') ? requiredHeaders : allHeaders;

    return function (req, res, next) {
        var hasAllHeaders = _.every(headers, _.partial(_.has, req.headers));
        if (!hasAllHeaders) {
            ErrorService.error(ErrorService.customError('MISSING_HEADERS'), req, res);
            return;
        }
        next();
    }
};
