/**
 * These are variables which are
 * used by the app and can be easily.
 *
 * All these variables can be
 * cofigured from here.
 **/
module.exports.values = {

    'MONGODB_URL': "mongodb://127.0.0.1:27017/pollster-dev",

    /****************************************************************************
     *  Secrect Keys for hashing should be below this                            *
     ****************************************************************************/
    'SALT_ROUNDS': 10,


    'CRYPTOKEY': 'superSecretId',
    'ACCESSKEY': 'superSecretToken',
    'REFRESHKEY': 'superSecretRefreshToken',
    'REFRESH_TOKEN_TIME': '45d',
    'ACCESS_TOKEN_TIME': '30d',

    /****************************************************************************
     *  Client id and App secrect for various api related variables              *
     *  below this                                                               *
     ****************************************************************************/
    'MAILGUN_API_KEY': 'key-f14a30faed9af3a888fb4df7ecb80557',
    'MAILGUN_DOMAIN': process.env.NODE_ENV != 'development' ? 'trunums.com' : 'sandbox37ff013300d64e7995e2c28a83a405be.mailgun.org',
    'MAILGUN_DOMAIN_TEMP': 'trunums.com',

    // 'MAXMIND_USERID': '116671',
    // 'MAXMIND_KEY': 'XpSZjOHM51jU1Apg',
    'MAXMIND_TYPE': 'country',

    'MAXMIND_USERID': '116661',
    'MAXMIND_KEY': 'XpSZjOHM51jU1Apg',
    

    /****************************************************************************
     *  Secrect Keys for S3 Bucket file storage                           *
     ****************************************************************************/

    'S3_KEY': process.env.NODE_ENV != 'production' ? 'AKIAITJVDOIP34FVFOIQ' : 'AKIAJETEJ7KIZ2SDHCQQ',
    'S3_SECRET': process.env.NODE_ENV != 'production' ? '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' : 'B0LQGFlfxGQEKlkZch9Ikof26MqYfXqQBm8VYaww',
    'S3_BUCKET': process.env.NODE_ENV != 'production' ? 'trunums-dev' : 'trunums.com',

    /****************************************************************************
     *  Refresh Token for Oauth2Play ground                         *
     ****************************************************************************/

    'REFRESH_TOKEN': process.env.NODE_ENV != 'production' ? '1/_m8In6cFVzAHJYVZM1KGfHJOImNR2Wx0AWuxN7pchiQ' : '',
    /****************************************************************************
     *  Connection strings or location for db or other strings below this        *
     ****************************************************************************/

    'ADMIN_URL': (process.env.NODE_ENV == 'production') ? "http://trunums.com/" :
        (process.env.NODE_ENV == 'test') ? "https://counting.trunums.com/" :
            (process.env.NODE_ENV == 'staging') ? "https://canvas.trunums.com/" :
                "http://localhost:9000/",

    'SERVER_URL': (process.env.NODE_ENV == 'production') ? "http://api.trunums.com/" :
        (process.env.NODE_ENV == 'test') ? "https://counting.trunums.com/" :
            (process.env.NODE_ENV == 'staging') ? "https://canvas.trunums.com/" :
                "http://localhost:3001/",
    'S3_URL': process.env.NODE_ENV != 'production' ? 'https://trunums-dev.s3.amazonaws.com/' : 'https://s3.amazonaws.com/trunums.com/',
    
    redis: process.env.REDIS_URL || process.env.REDIS_URI,
    jwtSecret: "supersecretkey",
    jwtRefreshSecret: "superRefreshsecretkey",
    refreshExpiry: '45d',
    authExpiry: '30d',
    serverURL: process.env.HOST,
    additionalHeaders: ['x-header-authtoken', 'x-header-refreshtoken'],
    twilioSid: 'AC2a37ef48635ba3d22a2bbf18e8430522',
    twilioAuthToken: '4c56ad9b8e1ba006a931557bca4b45e7',
    twilioPhoneNumber: '18507717469'
};
