/**
 * Created by Jyothi on 7/2/17.
 */

'use strict';

let errorMsgs = {
    'NOT_FOUND': 'Not found',
    'NOT_INVITED': 'You have not been invited, contact support.',
    'MISSING_PARAMS': 'Missing required parameters',
    'INTERNAL_SERVER_ERROR': 'Oops! Error occurred.',
    'VALIDATION_FAILED': 'Validations failed',
    'INVALID_GROUP_CODE': 'Invalid group code',
    'UNAUTHORISED': "Session expired, please re-login to continue using the app",
    'EMAIL_EXISTS': "User Exists With Same Email",
    'GROUP_EXISTS': 'Group code already exists',
    'UNVERIFIED_ACCOUNT': "Please verify your account",
    "USER_NOT_FOUND": "User not found",
    "PASSWORD_MISMATCH": "Incorrect password",
    "INCORRECT_EMAIL": "Email id doesn't exist",
    "MISSING_HEADERS" : "Please give all the required headers",
    "INVALID_TEST": "Test is Invalid",
    "INVALID_HEART_RATE": "Did not reached the theoretical heart rate",
    "VALID_TEST": "Test is successful",
    "INVALID_TYPE": "Please select the valid test i.e. either COOPER or ALTERNATIVE",
    "INVALID_AGE": "Age is invalid",
    "INVALID_DISTANCE": "Distance should be greater than zero miles",
    "INVALID_WEIGHT": "Weight is invalid",
    "INVALID_SAMPLE": "Sample is invalid",
    "INVALID_TIME": "Time is invalid",
    "RESULT_NOT_AVAILABLE": 'We don\'t have <%= data %> for the given age : <%= age %>, gender : <%= gender %>, ref : <%= min_ref %>',
    "NOTAUTHORIZED": 'Authorization failed',
    "VERIFIED_EMAIL": "Email already verified",
    "EMAIL_REQUIRED": "Email required"
};

let statusCode = {
    'NOT_FOUND': 400,
    'MISSING_PARAMS': 400,
    'INTERNAL_SERVER_ERROR': 500,
    'VALIDATION_FAILED': 400,
    'INVALID_GROUP_CODE': 400,
    'UNAUTHORISED': 401,
    'EMAIL_EXISTS': 401,
    'GROUP_EXISTS': 400,
    'UNVERIFIED_ACCOUNT': 403,
    "USER_NOT_FOUND": 400,
    "PASSWORD_MISMATCH": 400,
    "INCORRECT_EMAIL": 400,
    "MISSING_HEADERS" : 400,
    "INVALID_TYPE": 400,
    "INVALID_AGE": 400,
    "INVALID_DISTANCE": 400,
    "INVALID_WEIGHT": 400,
    "INVALID_SAMPLE": 400,
    "INVALID_TIME": 400,
    "NOTAUTHORIZED": 401,
    "VERIFIED_EMAIL": 400
};

var Raven = require('raven');

module.exports = {
    customError(errorType) {
        let msg = errorMsgs[errorType] || errorMsgs['INTERNAL_SERVER_ERROR'];
        let e = new Error(msg);
        e.status = statusCode[errorType] || 500;
        return e;
    },
    getErrorMsg(errorType) {
        return errorMsgs[errorType] || errorMsgs['INTERNAL_SERVER_ERROR'];
    },
    error(err, req, res) {

        // if(process.env.NODE_ENV == 'production') {
            Raven.captureException(err);
        // }

        let error = {
            status: err.status || 500,
            message: err.message || err.stack.split(/\s*\n\s*/, 2).join(' ') || ErrorService.getErrorMsg('INTERNAL_SERVER_ERROR')
        };
        console.log(`Error :: ${err}`);
        res.status(error.status).send({ success: false, message: error.message });
    }
};
