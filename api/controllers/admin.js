const redis = require("redis");
const client = redis.createClient();
const bcrypt = require("bcrypt");
const AuthService = require('../services/auth-token-service');
const tokenService = require("../config/tokenservice");
const User = require("../models/User");
const values = require('../config/values');
const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const _ = require('lodash');
const file = require('../models/file');
const virtualID = require("../models/VirtualID");

const api_key = values.values.MAILGUN_API_KEY;
const domain = values.values.MAILGUN_DOMAIN_TEMP;

const mailgun = require("mailgun-js")({
    apiKey: api_key,
    domain: domain
});

adminController = () => { };

adminController.create = (req, res) => {
    User.find({
        $or: [{
            userName: req.body.userName
        }, {
            email: req.body.email
        }]
    }).exec((err, document) => {
        // If error it returns error
        if (err) {
            res.status(500).json({
                success: false,
                message: "Server side error occurred"
            });
        }

        if (document[0] && document[0]["_doc"]) {
            if (document[0]["_doc"].email === req.body.email) {
                res.status(200).json({
                    success: false,
                    message: "This email address is already registered with truNums"
                });
            } else if (document[0]["_doc"].userName === req.body.userName) {
                res.status(200).json({
                    success: false,
                    message: "Username already taken. Please try using different username."
                });
            }
        } else {
            bcrypt.genSalt(values.values.SALT_ROUNDS,  (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                  if (hash) {
                    var userObj = new User();
                    userObj.email = req.body.email;
                    userObj.password = hash;
                    userObj.firstName = req.body.firstName;
                    userObj.lastName = req.body.lastName;
                    userObj.gender = req.body.gender;
                    userObj.address = "";
                    userObj.userName = req.body.userName;
                    userObj.tokenId = "";
                    userObj.role = "admin";
                    userObj.emailVerified = "true";
                    userObj.save((err, data) => {
                      if (!err) {
                        res.json({
                          result: true,
                          message: "Admin created successfully"
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
        }
    });
}

adminController.login = (req, res) => {
    var userType = req.body.userName;
    var password = req.body.password;
    if (!userType || !password) {
        res.status(401).json({
            err: 'Please fill all the mandatory fields highlighted above'
        });
    }
    User.find({
        $or: [{
            email: userType
        }, {
            userName: userType
        }]
    }).exec((err, docs) => {
        let user;
        if (docs && docs.length > 0) {
            user = docs[0]["_doc"];
        }
        if (err) {
            res.status(500).json({
                success: false,
                message: "Server side error occurred"
            });
        }
        if (!user) {
            res.json({
                success: false,
                message: 'Please enter valid login credentials'
            });
        } else if (user.role !== "admin") {
            res.json({
                success: false,
                message: 'Please enter valid login credentials'
            });
        } else {
            bcrypt.compare(req.body.password, user.password, (err, valid) => {
                if (err) return res.serverError(err);
                if (!valid) {
                    res.json({
                        success: false,
                        message: 'Please enter valid admin login credentials'
                    });
                } else {
                    // Assign tokens to the user
                    user.id = String(user._id);
                    var authToken = AuthService.createToken(user);
                    var tokens = {
                        authToken: authToken,
                    };
                    var _authenticated = true;
                    // Store in Redis
                    client.set("_a", _authenticated, redis.print);
                    client.hmset(tokens.authToken, "userId", user.id.toString(), "jwtToken", tokens.authToken, "role", user.role, redis.print);
                    user.tokens = tokens;

                    res.status(200).json({
                        success: true,
                        result: user
                    });
                }
            });
        }
    });
}

adminController.logout = (req, res) => {
    // Redis delete tokens
}

adminController.recoverPassword = (req, res) => {
    var newpassword = req.body.password;
    User.find({
        "tokenId": req.body.tokenId
    }).exec((err, document) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: "Server side error occurred"
            });
        } else {
            if (document && document.length > 0) {
                bcrypt.genSalt(values.values.SALT_ROUNDS, (err, salt) => {
                    bcrypt.hash(newpassword, salt, (err, hash) => { 
                        if(hash){
                          User.findOneAndUpdate({ tokenId: req.body.tokenId },
                                { $set: { password: hash } },
                                { new: true }, 
                                (err, doc) => {
                                  if(doc){  
                                    res.json({
                                        success: true,
                                        message: "Password changed successfully"
                                    });
                                  }
                                });
                        }
                        else{
                            res.json({
                                success: false,
                                message: "Please choose strong password1"
                            });
                        }            
                    });
                });
            } else {
                res.json({
                    success: false,
                    message: "Token ID expired"
                });
            }
        }
    });
}

adminController.getActiveUsers = (req, res) => {
    User.aggregate([
        {
            $match: {
                "userStatus": "Active",
                "role": "user"
            }
        }
    ]).exec((error, response) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Server side error occurred"
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Data retrival successful",
                data: response
            });
        }
    })
}

adminController.getUserProfile = (req, res) => {
    const param = req.params.userId;
    User.findById({
        _id: ObjectId(param)
    }).exec((err, user) => {
        if (user === undefined) {
            return res.notFound();
        }
        options = {
            pollster: user.id,
            sort: 'createdAt desc'
        };
        options.status = {
            $in:  ['Open','Promoted','InActive','Expired']
        };
        PollService.getAllPolls(options)
            .exec(function(err, polls) {
                // If Error return it
                if (err) return res.serverError(err);
                // If polls not found
                if (!polls || polls === undefined)
                    return res.ok({
                        user: user
                    });
                // Else return polls
                if (req.payload !== undefined) {

                    PollResult.find({
                        poll: _.pluck(polls, 'id'),
                        user: req.payload.userId
                    })
                        .exec(function(err, votes) {
                            if (err) return res.serverError(err);
                            if (!votes || votes === undefined)
                                return res.ok({
                                    user: user
                                });

                            _.each(_.groupBy(votes, 'poll'), function(polls, key) {
                                votes[key] = polls[0].result
                            });
                            _.map(polls, function(poll) {
                                poll.result = votes[poll.id];
                                return poll
                            })

                            if (req.payload) {

                                PollService.getPollsWithVotes(polls, req.payload.userId)
                                    .then(function(polls) {
                                        if (req.tokens) {
                                            return res.ok({
                                                result: polls,
                                                tokens: req.tokens,
                                                user: user
                                            });
                                        } else {
                                            res.ok({
                                                result: polls,
                                                user: user
                                            });
                                        }
                                    })
                            } else {
                                if (req.tokens) {
                                    return res.ok({
                                        result: polls,
                                        tokens: req.tokens,
                                        user: user
                                    });
                                } else {
                                    res.ok({
                                        result: polls,
                                        user: user
                                    });
                                }
                            }



                        });
                } else {
                    res.ok({
                        result: polls,
                        user: user
                    });
                }

            })
    })
}

adminController.forgotPassword = (req, res) => {
    User.find({
        email: req.body.email
    }).exec((error, result) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Server side error occurred"
            });
        } else {
            if (result && result[0] && result[0]["_doc"] && result[0]["_doc"]["role"] === "admin") {
                var email = req.body.email;
                var tokenId = crypto.randomBytes(32).toString("hex");
                // var webUrl = req.headers.origin + "/api/admin/recoverPassword/" + tokenId;
                var webUrl = req.headers.origin + "/password/reset/" + tokenId;
                var img = req.headers.origin + "/assets/images/logo.png";
                var toEmail = email;
                var resetHtml = () => {
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
                User.findOneAndUpdate(
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
                            res.status(500).json({
                                success: false,
                                message: "Server side error occurred"
                            });
                        } else {
                            if (data) {
                                mailgun.messages().send(mimedata, function (error, body) {
                                    if (body) {
                                        res.json({
                                            success: true,
                                            message: "Reset email sent successfully"
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "User not exists"
                                        });
                                    }
                                });
                            } else
                                res.json({
                                    success: false,
                                    message: "User not exists"
                                });
                        }
                    }
                );
            } else {
                res.status(200).json({
                    success: false,
                    message: "Entered Email is not associated with any admin accounts"
                });
            }
        }
    })
    
}

adminController.getUserPrivateSitesStorage = (req, res) => {
    let siteIds
    if (req.query && req.query.id) {
        siteIds = JSON.parse(req.query.id)
        let ids = []
        for(let i= 0; i<siteIds.length; i++) {
            ids.push(ObjectId(siteIds[i]))
        }
        console.log(ids);
        virtualID.aggregate([
            {
                $match: {
                    _id: { $in: ids }
                },
            },
            {
                $lookup: {
                    from: "file",
                    let: { privateSiteId: "$_id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$privateSiteId", "$$privateSiteId"]
                                }
                            }
                        },
                        {
                        $group: { _id: null, storageUsed: {$sum: "$metaData.size"}}
                        },
                        {
                            $project: {
                                storageUsed : 1
                            }
                        }
                    ],
                    as: "siteStorage"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    ownerId: { $first: "$ownerId" },
                    siteName: { $first: "$firstName" },
                    profilePicture: { $first: "$profilePicture" },
                    privateSiteSettings: { $first: "$privateSiteSettings" },
                    privateSiteStorage: {$first: "$siteStorage"}
                }
            }
        ], (err, data) => {
            if (err) {
                res.json(err);
            } else {
                data.map((privateSite)=>{
                    if(privateSite.privateSiteStorage.length >= 1) {
                        privateSite.privateSiteStorage = privateSite.privateSiteStorage[0].storageUsed;
                    } else {
                        privateSite.privateSiteStorage = 0;
                    }
                })
                res.json(data)
            }
        })
    }
}

adminController.forgotuserName = (req, res) => {
    var email = req.body.email;
    var origin = req.headers.origin;
    var img = origin + "/assets/images/logo.png";
    var toEmail = email;
    var userNameHtml = (user_name) => {
        return (
        "<!doctype html><html><head><meta charset='UTF-8'><title>Your Username</title> <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet'> </head><body style='background:#f4f4f4; font-family: 'Open Sans', sans-serif; margin:0; padding:0;'><div style='max-width:620px; margin:50px auto; padding:20px 20px; background:#FFF;'><table width='100%' border='0' cellspacing='0' cellpadding='0'> <tbody> <tr> <td align='center'><img src='" +
        img +
        "'/></td></tr><tr> <td><div style='margin-top:80px;'></div></td></tr><tr> <td><h1 style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#000000; font-weight:600;'>Forgot Username</h1></td></tr><tr> <td><div> <p style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#656565; font-weight:400;'>We received a request to reveal your Username.<br/>Your Username: <span>'" +
        user_name +
        "'</span></p></div></td></tr><tr> <td><p style='margin-top:30px; color:#1E1E1E; font-size:14px;'>If you did not request for your Username, please contact support immediately.</p></td></tr></tbody></table></div></body></html>"
        );
    };
    User.aggregate(
        [
            {
                $match: {
                    email: req.body.email
                }
            }
        ],
        (err, data) => {
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
                        if (body) {
                            res.json({
                                success: true,
                                message: "Successfully sended"
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "Mail send failed"
                            });
                        }
                    });
                } else {
                    res.json({
                        success: false,
                        message: "User not exists"
                    });
                }
            }
        }
    );
}

adminController.getPolls = (req, res) => {

}

adminController.createPromotePoll = (req, res) => {

}

adminController.updatePromotedPoll = (req, res) => {

}

adminController.broadcastEmail = (req, res) => {
    let userEmails = req.body.emails;
    let img = req.headers.origin + "/assets/images/logo.png";
    // let webUrl = req.headers.origin + "/drive/";
    let broadcastEmail = () => {
        return (
          "<!doctype html><html><head><meta charset='UTF-8'><title>"+ req.body.subject +"</title> <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet'> </head><body style='background:#f4f4f4; font-family: 'Open Sans', sans-serif; margin:0; padding:0;'><div style='max-width:620px; margin:50px auto; padding:20px 20px; background:#FFF;'><table width='100%' border='0' cellspacing='0' cellpadding='0'>" + 
          req.body.html + "</body>"
        //   <tbody> <tr> <td align='center'><img src='" +
        //   img +
        //   "'/></td></tr><tr> <td><div style='margin-top:80px;'></div></td></tr><tr> <td><h1 style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#000000; font-weight:600;'>Reset your password</h1></td></tr><tr> <td><div> <p style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#656565; font-weight:400;'>We have received a request to reset password for the <br/>truNums account email <a href='#' style='color:#5293BD; font-weight:600; text-decoration:none;'></a><br/> Click on the button below to set a new password.</p></div></td></tr><tr> <td><a href='" +
        //   webUrl +
        //   "' style='background:#5293BD; color:#FFF; border-radius:3px; padding:0 10px; text-decoration:none; font-size:12px; line-height:40px; display:inline-block; font-weight:400; margin:10px 0;'>RESET YOUR PASSWORD</a></td></tr><tr> <td><p style='margin-top:30px; color:#1E1E1E; font-size:14px;'>If you have not requested for a password reset, please contact support immediately.</p></td></tr></tbody></table></div></body></html>"
        );
    };

    let mimedata = {
        from: "truNums <admin@trunums.com>",
        to: userEmails,
        subject: req.body.subject,
        html: broadcastEmail()
    };
    mailgun.messages().send(mimedata, (error, status) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Email broadcast failed. Please try again later"
            });
        } else {
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "Email broadcast successful"
                });
            }
        }
    })
}

adminController.invite = (req, res) => {
    const emails = [];
    const origin =  req.headers.origin;

    req.body.emails.forEach((email) => {
        emails.push(email.name);
    })

    User.find({
        email: {
            $in: emails
        }
    }).exec((err, users) => {
        // If Error return it
        if (err) return res.serverError(err);
        let a = [];
        if (users.length > 0) {
            a = users.map(user => user.email);
        }

        let emailsArray = _.difference(emails, a);
        if (emailsArray.length === 0) {
            res.status(200).json({
                success: true,
                message: "User[s] already exists"
            });
        } else if (emailsArray.length > 0) {
            // let img = req.headers.origin + "/assets/images/logo.png";
            let img = "trunums.com/assets/images/logo.png";
            // let admin_url = req.headers.origin;
            let admin_url = "trunums.com";
            let inviteHtml = () => {
                return "<!doctype html><html><head><meta charset='UTF-8'><title>Accept Invite</title> <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet'> </head><body style='background:#f4f4f4; font-family: 'Open Sans', sans-serif; margin:0; padding:0;'><div style='max-width:620px; margin:50px auto; padding:20px 20px; background:#FFF;'><table width='100%' border='0' cellspacing='0' cellpadding='0'> <tbody> <tr> <td align='center'><img src= '" + img + "' /></td></tr><tr> <td><div style='margin-top:80px;'></div></td></tr><tr> <td><h1 style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#000000; font-weight:600;'>Welcome</h1></td></tr><tr> <td><div> <p style='font-family: 'Open Sans', sans-serif; font-size:16px; color:#656565; font-weight:400;'> truNums Admin has invited you to start using TruNums. Please click the button below to accept the invite and get started.</p></div></td></tr><tr> <td><a href='" + admin_url + "' style='background:#5293BD; color:#FFF; border-radius:3px; padding:0 10px; text-decoration:none; font-size:12px; line-height:40px; display:inline-block; font-weight:400; margin:10px 0;'>GET STARTED</a></td></tr></tbody></table></div></body></html>";
            };

            let mimedata = {
                from: "truNums <admin@trunums.com>",
                to: emailsArray,
                subject: "Trunums Invitation",
                html: inviteHtml()
            };
            mailgun.messages().send(mimedata, (error, body) => {
                if (body) {
                    if (a && a.length === 0) {
                        res.json({
                            success: true,
                            message: "Invite sent to " + emailsArray.length + " user[s]"
                        });
                    } else {
                        res.json({
                            success: true,
                            message: "Invites sent to " + emailsArray.length + " user[s]. " + a.length + " user[s] already exists"
                        });
                    }
                } else {
                  res.json({
                    success: false,
                    message: "Server side error occurred"
                  });
                }
            });
        }
    });
}

adminController.getUsers = (req, res) => {
    console.log(req.body);
    User.aggregate([
        {
            $match: {
                "role": "user"
            }
        },
        {
            $lookup: {
              from: "poll",
              let: {
                userId: "$_id"
              },
              pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ["$pollster", "$$userId"]
                        }
                    }
                },
                { $group: { _id: null, count: { $sum: 1 } } },
                {
                    $project: {
                        count: 1
                    }
                }
              ],
              as: "numberOfPolls"
            }
        },
        {
            $group: {
                _id: "$_id",
                firstName: { $first:'$firstName' },
                lastName: { $first:'$lastName' },
                emailVerified: { $first:'$emailVerified' },
                userStatus: { $first:'$userStatus' },
                pollCount: { $first: "$numberOfPolls.count" },
                siteId: { $first: "$virtualUID" },
                // createdAt: {$first: "$createdAt"}
            }
        },
        {
            $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                emailVerified: 1,
                userStatus: 1,
                pollCount: 1,
                siteId: 1,
                createdAt: { $toDate: "$_id" } 
            }
        }
    ]).exec((error, response) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Server side error occurred"
            });
        } else {
            let users = response;
            let mainSiteStoragePromises = [];
            let privateSiteStoagePromises = [];
            if (users && users.length > 0) {
                users.forEach((user) => {
                    mainSiteStoragePromises.push(adminController.common.getMainSiteStorage((user._id).toString()));
                    if (user && user["siteId"] && user["siteId"].length > 0) {
                        privateSiteStoagePromises.push(adminController.common.getPrivateSiteStoage((user.siteId[0]), (user._id).toString()));
                    } else {
                        privateSiteStoagePromises.push(adminController.common.getPrivateSiteStoage("", (user._id).toString()));
                    }
                })

                if (mainSiteStoragePromises.length > 0 && privateSiteStoagePromises.length > 0) {
                    Promise.all(mainSiteStoragePromises).then((mainSiteStorageResolves) => {
                        Promise.all(privateSiteStoagePromises).then((privateSiteStorageResolves) => {
                            console.log("Storage" ,privateSiteStorageResolves);
                            let mainSiteStorages = _.assign.apply(_, mainSiteStorageResolves);
                            let privateSiteStorages = _.assign.apply(_, privateSiteStorageResolves);
                            users.forEach((user) => {
                                let id = (user._id).toString();
                                user["mainSiteStorage"] = mainSiteStorages[id];
                                user["privateSiteStorage"] = privateSiteStorages[id];
                            });
                            res.status(200).json({
                                success: true,
                                message: "Data retrival successful",
                                data: users
                            });
                        });
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        message: "Data retrival successful",
                        data: response
                    });
                }
            }
        }
    });
}

adminController.updateCreatedAtForUsers = (req, res) => {
    // User.aggregate([
    //     {
    //         $match: {
    //             "role": "user"
    //         }
    //     },
    //     { 
    //         $group: {
    //             _id: "$_id",
    //             firstName: { $first:'$firstName' },
    //             lastName: { $first:'$lastName' },
    //             createdAt: {$first: "$createdAt"}
    //         }
    //     }
    // ]).exec((error, response) => {

    //     if (error) {
    //         res.status(500).json({
    //             success: false,
    //             message: "Server side error occurred"
    //         });
    //     } else {
    //         let failed = false
    //         console.log(ObjectId(response[0]._id).getTimestamp());
    //         let users = response;
    //         if (users && users.length > 0) {
    //             users.forEach((user) => {
    //                 if(user['createdAt'] !== undefined) {
    //                     let createdAt = ObjectId(user._id).getTimestamp();
    //                     User.findOneAndUpdate(
    //                         { _id: user._id },
    //                         { $set: { createdAt: createdAt } },
    //                         { new: true },
    //                         (err,res) => {
    //                             if(err) {
    //                                 failed = true;
    //                                 console.log(err);
    //                             } else {
    //                                 console.log("Added created at Successfully");
    //                             }
    //                         }
    //                     )
    //                 }
    //             })
    //             if(failed) {
    //                 res.status(500).json("Update Failed")
    //             } else {
    //                 res.status(200).json("SuccessFullll")
    //             }
    //         }
    //     }
    // });
}

adminController.common = {
    getMainSiteStorage: (user_id) => {
        return new Promise((resolve, reject) => {
            file.aggregate([
                {
                    $match: {
                        createdBy: ObjectId(user_id),
                        privateSiteId: null
                    }
                },
                {
                    $project: {
                        metaData: 1
                    }
                }
            ]).exec((error, docs) => {
                let totalStorageUsed = 0;
                if (docs.length > 0) {
                    for (let i = 0; i < docs.length; i++) {
                        totalStorageUsed = totalStorageUsed + docs[i]["metaData"]["size"];
                    }
                    resolve({[user_id]: totalStorageUsed.toFixed(2)});
                } else {
                    resolve({ [user_id]: '0' });
                }
            });
        });
    },
    getPrivateSiteStoage: (site_id, user_id) => {
        return new Promise((resolve, reject) => {
            if (!site_id || site_id.length === 0) {
                resolve({ [user_id]: '0' });
            } else {
                file.aggregate([
                    {
                        $match: {
                            privateSiteId: ObjectId(site_id)
                        }
                    },
                    {
                        $project: {
                            metaData: 1
                        }
                    }
                ]).exec((error, docs) => {
                    let totalStorageUsed = 0;
                    if (docs.length > 0) {
                        for (let i = 0; i < docs.length; i++) {
                            totalStorageUsed = totalStorageUsed + docs[i]["metaData"]["size"];
                        }
                        resolve({[user_id]: totalStorageUsed.toFixed(2)});
                    } else {
                        resolve({ [user_id]: '0' });
                    }
                });
            }
        });
    }
}

module.exports = adminController;