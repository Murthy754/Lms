var redis = require("redis");
var client = redis.createClient();
var express = require("express");
var router = express.Router();
var values = require("../config/values");
var bcrypt = require("bcrypt");
var tokenService = require("../config/tokenservice");
var api_key = values.values.MAILGUN_API_KEY;
var domain = values.values.MAILGUN_DOMAIN_TEMP;
var user = require("../models/User");
var crypto = require("crypto");
const { ObjectId } = require("mongodb");
var middlewares = require("../middlewares/authorization");
var AuthService = require('../services/auth-token-service');

var geoip = require("geoip2ws")({
  userId: values.values.MAXMIND_USERID,
  licenseKey: values.values.MAXMIND_KEY,
  service: values.values.MAXMIND_TYPE
});
var mailgun = require("mailgun-js")({
  apiKey: api_key,
  domain: domain
});

// To Get Current Location of the user
router.get("/me/:id", (req, res) => {
  user
    .find({
      _id: ObjectId(req.params.id)
    })
    .exec((err, data) => {
      if (err) {
      }
      res.send(data);
      // console.log(data);
    });
});
router.get("/getmyloc", (req, res, next) => {
  var ip;
  if (req.get('host').includes('localhost')) {
    var ip = "me";
  } else {
    var ip =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
  }
  geoip(ip, function (err, data) {
    var obj = {
      names: {
        en: "India",
        name: "IN"
      }
    }
    if (err) {
      // return res.json(err);
      return res.json(obj);
    }
    if (data) {
      res.json(data.country);
    }
  });
});

/*to create user sending a verfication mail*/
router.post("/create", (req, res) => {
  // console.log(req.paylod);
  var tokenId = crypto.randomBytes(32).toString("hex");
  var webUrl = req.headers.origin + "/api/email/verify/" + tokenId;
  var img = req.headers.origin + "/assets/images/logo.png";
  var verifyHtml = function () {
    return (
      "<!doctype html><html><head><meta charset='UTF-8'><title>Verify your Email</title><style>@import 'https://fonts.googleapis.com/css?family=Open+Sans:400,600,700';</style></head><body style='background:#f4f4f4; font-family: 'Open Sans', sans-serif; margin:0; padding:0;'><div style='max-width:620px; margin:50px auto; padding:20px 20px; background:#FFF;'><table width='100%' border='0' cellspacing='0' cellpadding='0'> <tbody> <tr> <td align='center'><img src='" +
      img +
      "'/></td></tr><tr> <td><div style='margin-top:80px;'></div></td></tr><tr> <td><h1 style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#000000; font-weight:600;'>Verify Email</h1></td></tr><tr> <td><div> <p style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#656565; font-weight:400;'>Welcome to truNums! We are ready to activate your account.<br/>Please click the button below to verify your email address.</p></div></td></tr><tr> <td><a href='" +
      webUrl +
      "' style='background:#5293BD; color:#FFF; border-radius:3px; padding:0 10px; text-decoration:none; font-size:12px; line-height:40px; display:inline-block; font-weight:400; margin:10px 0;'>VERIFY</a></td></tr><tr> <td><p style='margin-top:30px; color:#1E1E1E; font-size:14px;'>If you did not create a truNums account, please ignore this email.</p></td></tr></tbody></table></div></body></html>"
    );
  };
  var data = {
    from: "truNums <admin@trunums.com>",
    to: req.body.toMail,
    subject: "Email Verification",
    html: verifyHtml()
  };
  mailgun.messages().send(data, function (error, body) {
    if (body) {
      bcrypt.genSalt(values.values.SALT_ROUNDS, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
          if (hash) {
            var userObj = new user();
            userObj.email = req.body.email;
            userObj.password = hash;
            userObj.firstName = req.body.first_name;
            userObj.lastName = req.body.last_name;
            userObj.gender = req.body.gender;
            userObj.address = req.body.address;
            userObj.userName = req.body.username;
            userObj.tokenId = tokenId;
            if(req.body.phoneVerified) {
              userObj.phoneVerified = req.body.phoneVerified;
              userObj.phone = req.body.phone,
              userObj.eligibleForUserBenefits = true;
            }
            userObj.save((err, data) => {
              if (!err) {
                res.json({
                  result: true,
                  message: "sucessfull"
                });
              } else {
                res.json({
                  result: false,
                  message: "User is already exists"
                });
              }
            });
          } else {
            res.json({
              result: false,
              message: "Please choose strong password"
            });
          }
        });
      });
    } else {
      res.json({
        result: false,
        message: "Unable to Verify Mail Address Places Check Your Mail Adders."
      });
    }
  });
});

/* User Login */
router.post("/login", (req, res) => {
  console.log("login");
  var userType = req.body.username;
  var password = req.body.password;
  userObjectect = [];
  user
    .find({
      $or: [
        {
          email: userType
        },
        {
          userName: userType
        }
      ]
    })
    .exec((err, userObj) => {
      userObject = userObj;
      if (!err) {
        if (userObject.length >= 1) {
          console.log("update");
          var value=true;
        
        
          var enbcrypt = require("bcrypt");
          enbcrypt.compare(password, userObject[0].password, function (
            err,
            resl
          ) {
            var match = resl;
            if (match) {
              var authToken = tokenService.newAuthToken(
                userObject[0]._id + "",
                userObject[0].role
              );
              /* var refreshToken = tokenService.newRefreshToken(
                userObject[0].role
              ); */
              var tokens = {
                authToken: authToken,
                refreshToken: AuthService.createRefreshToken(userObj[0]),
                jwtToken: AuthService.createToken(userObj[0])
              };
              // console.log(tokens);
              var _authenticated = true;
              client.set("_a", _authenticated, redis.print);
              client.hmset(tokens.authToken, "userId", userObj[0].id.toString(), "refreshToken", tokens.refreshToken, "jwtToken", tokens.jwtToken, redis.print);
              var myObj = {};
              myObj.token = tokens;
              userObject[0].token = tokens;
              if (userObject[0].userStatus == "Blocked") {
                res.json({
                  result: false,
                  message: "User Blocked"
                });
              }
              if (!userObject[0].emailVerified) {
                res.json({
                  result: false,
                  message: "Please verify your emal"
                });
              } else {
                user.findByIdAndUpdate(
                  ObjectId(userObj[0]._id),
                  {
                    $set: {
                      onlineStatus: value
                    }
                  },
                  {
                    new: true
                  },
                  (err, updateProfile) => {
                    // res.send(updateProfile);
                    res.json({
                      result: true,
                      user: userObject[0],
                      tokens: tokens
                    });
                  }
                );

                // res.json({
                //   result: true,
                //   user: userObject[0],
                //   tokens: tokens
                // });
              }
            } else {
              res.json({
                result: false,
                message: "Please enter valid login credentials"
              });
            }
          });
        } else {
          res.json({
            result: false,
            message: "Please enter valid login credentials"
          });
        }
      }
    });
});

/* forgot password */
router.post("/forgotUserName", (req, res) => {
  var email = req.body.email;
  var origin = req.headers.origin;
  var img = req.headers.origin + "/assets/images/logo.png";
  var toEmail = email;
  var userNameHtml = function (user_name) {
    return (
      "<!doctype html><html><head><meta charset='UTF-8'><title>Your Username</title> <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet'> </head><body style='background:#f4f4f4; font-family: 'Open Sans', sans-serif; margin:0; padding:0;'><div style='max-width:620px; margin:50px auto; padding:20px 20px; background:#FFF;'><table width='100%' border='0' cellspacing='0' cellpadding='0'> <tbody> <tr> <td align='center'><img src='" +
      img +
      "'/></td></tr><tr> <td><div style='margin-top:80px;'></div></td></tr><tr> <td><h1 style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#000000; font-weight:600;'>Forgot Username</h1></td></tr><tr> <td><div> <p style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#656565; font-weight:400;'>We received a request to reveal your Username.<br/>Your Username: <span>'" +
      user_name +
      "'</span></p></div></td></tr><tr> <td><p style='margin-top:30px; color:#1E1E1E; font-size:14px;'>If you did not request for your Username, please contact support immediately.</p></td></tr></tbody></table></div></body></html>"
    );
  };
  user.aggregate(
    [
      {
        $match: {
          email: req.body.email
        }
      }
    ],
    function (err, data) {
      if (err) {
        res.json({
          result: false,
          message: "User not exists"
        });
      } else {
        if (data.length >= 1) {
          var mail = {
            from: "truNums <admin@trunums.com>",
            to: toEmail,
            subject: "Your truNums Username",
            html: userNameHtml(data[0].userName)
          };
          mailgun.messages().send(mail, function (error, body) {
            // console.log(body, error);
            if (body) {
              res.json({
                result: true,
                message: "Successfully sended"
              });
            } else {
              res.json({
                result: false,
                message: "mail didnot sended"
              });
            }
          });
        } else {
          res.json({
            result: false,
            message: "User not exists"
          });
        }
      }
    }
  );
});

// forgot password
router.put("/forgotPassword", (req, res) => {
  var email = req.body.email;
  var tokenId = crypto.randomBytes(32).toString("hex");
  var webUrl = req.headers.origin + "/recoverPassword/" + tokenId;
  var img = req.headers.origin + "/assets/images/logo.png";
  // console.log()
  var toEmail = email;
  var resetHtml = function () {
    return (
      "<!doctype html><html><head><meta charset='UTF-8'><title>Reset your password</title> <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet'> </head><body style='background:#f4f4f4; font-family: 'Open Sans', sans-serif; margin:0; padding:0;'><div style='max-width:620px; margin:50px auto; padding:20px 20px; background:#FFF;'><table width='100%' border='0' cellspacing='0' cellpadding='0'> <tbody> <tr> <td align='center'><img src='" +
      img +
      "'/></td></tr><tr> <td><div style='margin-top:80px;'></div></td></tr><tr> <td><h1 style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#000000; font-weight:600;'>Reset your password</h1></td></tr><tr> <td><div> <p style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#656565; font-weight:400;'>We have received a request to reset password for the <br/>truNums account email <a href='#' style='color:#5293BD; font-weight:600; text-decoration:none;'>'" +
      toEmail +
      "'</a><br/> Click on the button below to set a new password.</p></div></td></tr><tr> <td><a href='" +
      webUrl +
      "' style='background:#5293BD; color:#FFF; border-radius:3px; padding:0 10px; text-decoration:none; font-size:12px; line-height:40px; display:inline-block; font-weight:400; margin:10px 0;'>RESET YOUR PASSWORD</a></td></tr><tr> <td><p style='margin-top:30px; color:#1E1E1E; font-size:14px;'>If you have not requested for a password reset, please contact support immediately.</p></td></tr></tbody></table></div></body></html>"
    );
  };
  var mimedata = {
    from: "truNums <admin@trunums.com>",
    to: toEmail,
    subject: "Reset password",
    html: resetHtml()
  };
  user.findOneAndUpdate(
    {
      email: email
    },
    {
      $set: {
        tokenId: tokenId
      }
    },
    {
      new: true
    },
    (err, data) => {
      if (err) {
        // res.json(err);
      } else {
        // console.log(data);
        if (data) {
          mailgun.messages().send(mimedata, function (error, body) {
            // console.log(body);
            if (body) {
              // console.log(tokenId);
              res.json({
                result: true,
                message: "Successfull"
              });
            } else {
              res.json({
                result: false,
                message: "User not existsu"
              });
            }
          });
        } else
          res.json({
            result: false,
            message: "User not exists"
          });
      }
    }
  );
});
//forgot social password email for google/facebook users for private site settings
router.put("/forgotSocialPassword", (req, res) => {
  var email = req.body.email;
  var tokenId = crypto.randomBytes(32).toString("hex");
  // var webUrl = req.headers.origin + "/#/recoverPassword/" + tokenId;
  var webUrl = req.headers.origin + "/settings/";

  var img = req.headers.origin + "/assets/images/logo.png";
  var randomstring = Math.random().toString(36).slice(-8);
  // console.log()
  var toEmail = email;
  var resetHtml = function () {
    return (
      "<!doctype html><html><head><meta charset='UTF-8'><title>Reset your password</title> <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet'> </head><body style='background:#f4f4f4; font-family: 'Open Sans', sans-serif; margin:0; padding:0;'><div style='max-width:620px; margin:50px auto; padding:20px 20px; background:#FFF;'><table width='100%' border='0' cellspacing='0' cellpadding='0'> <tbody> <tr> <td align='center'><img src='" +
      img +
      "'/></td></tr><tr> <td><div style='margin-top:80px;'></div></td></tr><tr> <td><h1 style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#000000; font-weight:600;'>Reset your password</h1></td></tr><tr><td>Your temporary password is :<b>" + randomstring + "</b></td></tr><tr> <td><div> <p style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#656565; font-weight:400;'>We have received a request to reset password for the <br/>truNums account email <a href='#' style='color:#5293BD; font-weight:600; text-decoration:none;'>'" +
      toEmail +
      "'</a><br/> Click on the button below to set a new password.</p></div></td></tr><tr> <td><a href='" +
      webUrl +
      "' style='background:#5293BD; color:#FFF; border-radius:3px; padding:0 10px; text-decoration:none; font-size:12px; line-height:40px; display:inline-block; font-weight:400; margin:10px 0;'>RESET YOUR PASSWORD</a></td></tr><tr> <td><p style='margin-top:30px; color:#1E1E1E; font-size:14px;'>If you have not requested for a password reset, please contact support immediately.</p></td></tr></tbody></table></div></body></html>"
    );
  };





  var mimedata = {
    from: "truNums <admin@trunums.com>",
    to: toEmail,
    subject: "Reset password",
    html: resetHtml()
  };


  bcrypt.genSalt(values.values.SALT_ROUNDS, function (err, salt) {
    bcrypt.hash(randomstring, salt, function (err, hash) {
      if (hash) {
        user.findOneAndUpdate(
          {
            email: email
          },
          {
            $set: {
              password: hash
            }
          },
          {
            new: true
          },
          (err, data) => {
            if (err) {
              // res.json(err);
            } else {
              // console.log(data);
              if (data) {
                mailgun.messages().send(mimedata, function (error, body) {
                  // console.log(body);
                  if (body) {
                    // console.log(tokenId);
                    res.json({
                      result: true,
                      message: "Successfull"
                    });
                  } else {
                    res.json({
                      result: false,
                      message: "User not existsu"
                    });
                  }
                });
              } else
                res.json({
                  result: false,
                  message: "User not exists"
                });
            }
          }
        )
      }
    });
  });
});
//Verifying email
// router.get("/emailverify/:id", (req, res) => {
//   var tokenId = req.params.id + "";
//   user.findOneAndUpdate(
//     {
//       tokenId: tokenId
//     },
//     {
//       $set: {
//         emailVerified: true
//       }
//     },
//     {
//       new: true
//     },
//     (err, data) => {
//       if (data) {
//         res.json({
//           result: true,
//           message: "Veifired Succesfull"
//         });
//       } else {
//         res.json({
//           result: false,
//           message: "Email vefication failed"
//         });
//       }
//     }
//   );
// });

//reset password
router.put("/updatepassword", middlewares.checkLogin, (req, res) => {
  var password = req.body.newpassword;
  var oldpassword = req.body.password;
  user
    .find({
      _id: ObjectId(req.body.id)
    })
    .exec((err, userObj) => {
      if (!err) {
        if (userObj) {
          // console.log(password, userObj[0].password);
          var match = false;
          if (!userObj[0].password && (userObj[0].password === undefined || userObj[0].password === null)) {
            bcrypt.genSalt(values.values.SALT_ROUNDS, function (err, salt) {
              bcrypt.hash(req.body.newpassword, salt, function (err, hash) {
                if (hash) {
                  user.findByIdAndUpdate(
                    ObjectId(req.body.id),
                    {
                      $set: {
                        password: hash
                      }
                    },
                    {
                      new: true
                    },
                    (err, updatepassword) => {
                      if (updatepassword) {
                        res.json({
                          result: true,
                          message: "Password updated successfully"
                        });
                      } else {
                        res.json({
                          result: false,
                          message: "Please enter valid password1"
                        });
                      }
                    }
                  );
                }
              });
            });
          } else {
            var enbcrypt = require("bcrypt");
            // console.log(oldpassword, userObj[0].password);
            // console.log("ELSE");
            enbcrypt.compare(oldpassword, userObj[0].password, function (
              err,
              resl
            ) {
              var match = resl;
              // console.log(match);
              if (match) {
                bcrypt.genSalt(values.values.SALT_ROUNDS, function (err, salt) {
                  bcrypt.hash(req.body.newpassword, salt, function (err, hash) {
                    if (hash) {
                      user.findByIdAndUpdate(
                        ObjectId(req.body.id),
                        {
                          $set: {
                            password: hash
                          }
                        },
                        {
                          new: true
                        },
                        (err, updatepassword) => {
                          if (updatepassword) {
                            res.json({
                              result: true,
                              message: "Password updated successfully"
                            });
                          } else {
                            res.json({
                              result: false,
                              message: "Passsord update Failed"
                            });
                          }
                        }
                      );
                    }
                  });
                });
              } else {
                res.json({
                  result: false,
                  message: "Old Password not matched. Please try again"
                });
              }
            });
          }
        } else {
          res.json({
            result: false,
            message: "Please enter valid password3"
          });
        }
      }
    });
});
router.post("/logout", (req, res) => {
  user.findByIdAndUpdate(
    ObjectId(req.body.id),
    {
      $set: {
        onlineStatus: false
      }
    },
    {
      new: true
    },
    (err, updateProfile) => {
      // res.send(updateProfile);
      res.json({
        result: true,
      });
    }
  );
});

module.exports = router;
