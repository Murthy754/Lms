const user = require('../models/User');
const tokenService = require("../config/tokenservice");
const AuthService = require('../services/auth-token-service');
const redis = require("redis");
const client = redis.createClient();

signupController = () => { };

signupController.social = (req, res, next) => {
    var socialId = req.body.id;
    var socialType = req.body.provider;
    var type = req.body.type;
    var query = {};
    var socialSite;
    if (socialType === 'google') {
        socialSite = {
        google: {
            id: socialId,
            accessToken: req.body.accessToken
        }
        }
    }
    else {
        socialSite = {
        facebook: {
            id: socialId,
            accessToken: req.body.accessToken
        }
        }
    }  
    query["socialsite." + socialType + ".id"] = socialId;
    user.find({$or:[query,{email:req.body.email}]}).exec((err, data) => {
        if (data && data.length <= 0) {
        console.log("User exists")
        if (type === 'check') {
            res.json({
            result: false,
            message: 'User doesn\'t exists.'
            });
        }
        else {
            var userObj = new user();
            if(req.body.phoneVerified) {
                userObj.phoneVerified = req.body.phoneVerified;
                userObj.phone = req.body.phone,
                userObj.eligibleForUserBenefits = true;
              }
            userObj.email = req.body.email;
            userObj.firstName = req.body.first_name;
            userObj.lastName = req.body.last_name;
            userObj.gender = req.body.gender;
            userObj.address = req.body.address;
            userObj.userName = req.body.username;
            userObj.emailVerified = true;
            userObj.socialsite = socialSite;
            userObj.password=null;
            userObj.profilePicture = req.body.profilePicture;
            userObj.save((errorr, dataa) => {
            if (!errorr && dataa) {
                res.json({
                result: true,
                user: dataa
                });
            }
            else{
                res.json({
                result: false,
                message: 'Username is exists.'
                });
            }
            });        
        }
        }
        else {
        console.log("User exists");
        var authToken = tokenService.newAuthToken(
            data[0]._id + "",
            data[0].role
        );
        var tokens = {
            authToken: authToken,
            refreshToken: AuthService.createRefreshToken(data[0]),
            jwtToken: AuthService.createToken(data[0])
        };
        var _authenticated = true;
        client.set("_a", _authenticated, redis.print);
        client.hmset(tokens.authToken, "userId", data[0].id.toString(), "refreshToken", tokens.refreshToken, "jwtToken", tokens.jwtToken, redis.print);
        res.json({
            result: true,
            user: data,
            tokens: tokens
        });
        }
    });
};

module.exports = signupController;