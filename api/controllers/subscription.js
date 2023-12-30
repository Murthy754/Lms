const { ObjectId } = require("mongodb");
const Subscription = require("../models/Subscription");
const values = require("../config/values");
const api_key = values.values.MAILGUN_API_KEY;
const domain = values.values.MAILGUN_DOMAIN_TEMP;
const invitations = require("../models/Invitations");
const mailgun = require("mailgun-js")({
    apiKey: api_key,
    domain: domain
});

subscriptionController = () => { };

subscriptionController.removeSubscription = (req, res, next) => {
    Subscription.findByIdAndRemove(ObjectId(req.body.id)).exec((err, doc) => {
        if (doc) {
            res.json({
            result: true
            });
        } else {
            res.json({
            result: false
            });
        }
    });
};

subscriptionController.userSubscription = (req, res, next) => {
    var siteValue = null;
    if (req.body.privateSiteId !== null) {
        siteValue = ObjectId(req.body.privateSiteId);
    }
    if (req.body.userid !== "null") {
        Subscription.find({
        subscriber: ObjectId(req.body.id),
        subscribee: ObjectId(req.body.userid),
        privateSiteId: siteValue
        }).exec((err, data) => {
        if (data) {
            if (data.length > 0) {
            res.json({
                result: true,
                data: data
            });
            } else {
            res.json({
                result: false,
                data: data
            });
            }
        } else {
          res.send(err);
        }
        });
    } else {
        res.json({
        result: false,
        data: []
        })
    }
};

subscriptionController.subscribers = (req, res, next) => {
    Subscription.aggregate(
        [
          {
            $match: {
              subscribee: ObjectId(req.body.id)
            }
          },
          {
            $match: {
              status: {
                $nin: ["UNSUBSCRIBE"]
              }
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
                userid: "$subscriber"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$userid"]
                    }
                  }
                },
                {
                  $project: {
                    firstName: 1,
                    lastName: 1,
                    userName: 1,
                    userStatus: 1,
                    address: 1,
                    profilePicture: 1,
                    id: 1
                  }
                }
              ],
              as: "subscribers"
            }
          },
          {
            $unwind: "$subscribers"
          }
        ],
        (err, data) => {
          if (err) {
            res.json(err);
          } else {
            res.json(data);
          }
        }
    );
};

subscriptionController.getSubscriptionsByCountry = (req, res, next) => {
    var siteValue = null;
    if (req.body.privateSiteId) {
      siteValue = ObjectId(req.body.privateSiteId);
    }
    Subscription.aggregate(
      [
        {
          $match: {
            subscriber: ObjectId(req.body.id)
          }
        },
        {
          $match: {
            privateSiteId: siteValue
          }
        },
        {
          $match: {
            status: {
              $nin: ["UNSUBSCRIBE"]
            }
          }
        },
        {
          $match: {
            status: {
              $nin: ["CANCELLED"]
            }
          }
        },
        {
          $lookup: {
            from: "user",
            let: {
              userid: "$subscribee",
              country: req.body.country
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$_id", "$$userid"]
                      },
                      {
                        $eq: ["$address.country", "$$country"]
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  userName: 1,
                  userStatus: 1,
                  address: 1,
                  profilePicture: 1,
                  email: 1,
                  privateSite:1,
                  id: 1
                }
              }
            ],
            as: "subscribee"
          }
        },
        {
          $unwind: "$subscribee"
        }
      ],
      (err, data) => {
        if (err) {
          res.json(err);
        } else {
          res.json(data);
        }
      }
    );
};

subscriptionController.getAllSubscriptions = (req, res, next) => {
    var siteValue = null;
    if (req.body.privateSiteId) {
      siteValue = ObjectId(req.body.privateSiteId);
    }
    Subscription.aggregate(
      [
        {
          $match: {
            subscriber: ObjectId(req.body.id)
          }
        },
        {
          $match: {
            privateSiteId: siteValue
          }
        }, 
        {
          $match: {
            status: {
              $nin: ["UNSUBSCRIBE"]
            }
          }
        },
        {
          $match: {
            status: {
              $nin: ["CANCELLED"]
            }
          }
        },
        {
          $lookup: {
            from: "user",
            let: {
              userid: "$subscribee"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$_id", "$$userid"]
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  userName: 1,
                  userStatus: 1,
                  address: 1,
                  profilePicture: 1,
                  email: 1,
                  id: 1,
                  privateSite:1,
                  privateSiteSettings:1
                }
              }
            ],
            as: "subscribee"
          }
        },
        {
          $unwind: "$subscribee"
        }
      ],
      (err, data) => {
        if (err) {
          res.json(err);
        } else {
          res.json(data);
        }
      }
    );
};

subscriptionController.getSubscribersByCountry = (req, res, next) => {
    var siteValue = null
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  Subscription.aggregate(
    [
      {
        $match: {
          subscribee: ObjectId(req.body.id)
        }
      },
      {
        $match: {
          privateSiteId: siteValue
        }
      },
      {
        $match: {
          status: {
            $nin: ["UNSUBSCRIBE"]
          }
        }
      },
      {
        $match: {
          status: {
            $nin: ["CANCELLED"]
          }
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            userid: "$subscriber",
            country: req.body.country
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$userid"]
                    },
                    {
                      $eq: ["$address.country", "$$country"]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                userName: 1,
                userStatus: 1,
                address: 1,
                privateSite:1,
                profilePicture: 1,
                email: 1,
                id: 1
              }
            }
          ],
          as: "subscriber"
        }
      },
      {
        $unwind: "$subscriber"
      }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        res.json(data);
      }
    }
  );
};

subscriptionController.getPrivateSubscribersByCountry = (req, res, next) => {
    Subscription.aggregate(
        [
          {
            $match: {
              subscribee: ObjectId(req.body.id)
            }
          },
          {
            $match: {
              privateSiteId: ObjectId(req.body.privateSiteId)
            }
          },
          {
            $match: {
              status: {
                $nin: ["UNSUBSCRIBE"]
              }
            }
          },
          {
            $match: {
              status: {
                $nin: ["CANCELLED"]
              }
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
                userid: "$subscriber",
                country: req.body.country
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$userid"]
                        },
                        {
                          $eq: ["$address.country", "$$country"]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    firstName: 1,
                    lastName: 1,
                    userName: 1,
                    userStatus: 1,
                    address: 1,
                    privateSite:1,
                    profilePicture: 1,
                    email: 1,
                    id: 1
                  }
                }
              ],
              as: "subscriber"
            }
          },
          {
            $unwind: "$subscriber"
          }
        ],
        (err, data) => {
          if (err) {
            res.json(err);
          } else {
            res.json(data);
          }
        }
      );
};

subscriptionController.getAllSubscribers = (req, res, next) => {
    var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  Subscription.aggregate(
    [
      {
        $match: {
          subscribee: ObjectId(req.body.id)
        }
      },
      {
        $match: {
          privateSiteId: siteValue
        }
      },
      {
        $match: {
          status: {
            $nin: ["UNSUBSCRIBE"]
          }
        }
      },
      {
        $match: {
          status: {
            $nin: ["CANCELLED"]
          }
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            userid: "$subscriber"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$userid"]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                userName: 1,
                userStatus: 1,
                address: 1,
                profilePicture: 1,
                email: 1,
                id: 1,
                privateSite:1,
                privateSiteSettings:1
              }
            }
          ],
          as: "subscriber"
        }
      },
      {
        $unwind: "$subscriber"
      }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        res.json(data);
      }
    }
  );
};

subscriptionController.getPrivateSiteSubscribers = (req, res, next) => {
    var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  Subscription.aggregate(
    [
      {
        $match: {
          subscribee: ObjectId(req.body.id)
        }
      },
      {
        $match: {
          privateSiteId: siteValue
        }
      },
      {
        $match: {
          status: {
            $nin: ["UNSUBSCRIBE"]
          }
        }
      },
      {
        $match: {
          status: {
            $nin: ["PENDING"]
          }
        }
      },
      {
        $match: {
          status: {
            $nin: ["CANCELLED"]
          }
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            userid: "$subscriber"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$userid"]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                userName: 1,
                userStatus: 1,
                address: 1,
                profilePicture: 1,
                email: 1,
                id: 1,
                privateSite:1,
                privateSiteSettings:1
              }
            }
          ],
          as: "subscriber"
        }
      },
      {
        $unwind: "$subscriber"
      }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        res.json(data);
      }
    }
  );
};

subscriptionController.getAllVirtualSubscribers = (req, res, next) => {
    var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  Subscription.aggregate(
    [
      {
        $match: {
          subscribee: ObjectId(req.body.id),
          subscriber: ObjectId(req.body.privateSiteId)
        }
      },
      {
        $match: {
          privateSiteId: siteValue
        }
      },
      {
        $match: {
          status: {
            $nin: ["UNSUBSCRIBE"]
          }
        }
      },
      {
        $match: {
          status: {
            $nin: ["CANCELLED"]
          }
        }
      },
      {
        $lookup: {
          from: "virtualID",
          let: {
            userid: "$subscriber"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$userid"]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                // userName: 1,
                // userStatus: 1,
                address: 1,
                profilePicture: 1,
                // email: 1,
                // id: 1
              }
            }
          ],
          as: "subscriber"
        }
      }
      // {
      //   $unwind: "$subscriber"
      // }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        res.json(data);
      }
    }
  );
};

subscriptionController.updateSubscrptionStatus = (req, res, next) => {
    Subscription.findByIdAndUpdate(
        ObjectId(req.params.id),
        {
          $set: {
            status: req.body.status
          }
        },
        {
          new: true
        },
        (err, status) => {
          if (status) {
            res.json({
              result: true
            });
          } else {
            res.json({
              result: false
            });
          }
        }
      );
};

subscriptionController.updateFeedOption = (req, res, next) => {
    Subscription.findByIdAndUpdate(
        ObjectId(req.params.id),
        {
          $set: {
            feedoption: req.body.feedoption
          }
        },
        {
          new: true
        },
        (err, feedoption) => {
          if (feedoption) {
            res.json({
              result: true
            });
          } else {
            res.json({
              result: false
            });
          }
        }
      );
};

subscriptionController.checkEmailInviteSubscriber = (req, res, next) => {
    invitations
    .find({
      userId: req.body.id,
      email: req.body.email
    })
    .exec((err, userObj) => {
      if (userObj.length > 0) {
        res.json({
          result: false,
          message: "User exists."
        });
      } else {
        res.json({
          result: true,
          message: "User doesn't exists."
        });
      }
    });
};

subscriptionController.checkInviteSubscriber = (req, res, next) => {
    invitations
    .find({
      userId: req.body.id,
      email: req.body.email
    })
    .exec((err, userObj) => {
      if (userObj.length > 0) {
        res.json({
          result: false,
          message: "User exists."
        });
      } else {
        res.json({
          result: true,
          message: "User doesn't exists."
        });
      }
    });
};

subscriptionController.sendSubscribeRequest = (req, res, next) => {
    var link = req.headers.origin + "/subscribers/";
    var link2 = req.headers.origin + "/subscribers/";
    var unsubscribe_url = req.headers.origin + "/subscribers/";
    var img = req.headers.origin + "/assets/images/logo.png";
    var down_logo = req.headers.origin + "/assets/images/logo.png";
    var map_img = req.headers.origin + "/assets/images/images/mapicon.png";
    var recipientName = req.body.recipientname;
    var recipientId = req.body.recipientid;
    var senderId = req.body.senderid;
    var senderName = req.body.sendername;
    var country = req.body.country;
    var tomail = req.body.tomail;
    var profile_pic = req.body.profilePicture;
    var invite = function () {
        return (
        "<html lang='en'><head> <meta charset='UTF-8'> <meta name='viewport' content='width=device-width, initial-scale=1.0'> <meta http-equiv='X-UA-Compatible' content='ie=edge'> <title>Email-html</title> <link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700' rel='stylesheet'> <style>body{background: #EEEEEE; text-align: center; font-family: 'Roboto', sans-serif}</style></head><body> <div style='background:#EEEEEE;float:left;width:100%;height:100%'><div style='max-width:680px;display:block;margin:20px auto;padding:10px;'> <ul style='margin:0;padding:0;list-style-type:none;background:#FFF;border-radius:6px;'> <li style='padding:25.5px 85px;text-align:center;'> <img src=" +
        img +
        "> </li></ul> <ul style='margin-top:8px;padding:34px 87px 28px 87px;list-style-type:none;background:#FFF;border-radius:3px;'> <li> <h4 style='font-size:20px;font-weight:400;letter-spacing:1px;line-height:22px;color:#000000;text-align:left'>Hi " +
        recipientName +
        ",<br/>you have a new subscriber!</h4> </li><li> <ul style='margin:0;padding:13px 0px 15px 0px;background:#F5F5F5;list-style-type:none;border-top:1px solid #CCCCCC;border-bottom:1px solid #CCCCCC;float: left;width: 100%;'> <li style='float:left;margin:6px 0 0 22px'> <img src='" +
        profile_pic +
        " ' alt=' ' height='44px' width='45px' style='border-radius:50%'> </li><li style='float:left;position:relative;margin:10px 0px 0 15px'> <p style='margin:0;font-size:14px;color:#1E1E1E;font-weight:400;text-transform:capitalize'>" +
        senderName +
        "</p><p style='margin:0;font-size:12px;color:#1E1E1E;font-weight:400;line-height:22px;text-align:left;padding-top:5px'><img src='" +
        map_img +
        "' alt='location' style='position:relative;top:2px;' >  " +
        country +
        "</p></li><li style='float:right;padding:18px 24px 12px 2px'> <a href=" +
        link +
        " style='color:#FFF;background:#5293BD;padding:9px 20px;text-decoration:none;font-size:14px;font-weight:300'> View Request</a> </li></ul> </li><li style='float: left;width: 100%;'> <p style='color:#909090;font-size:12px;font-weight:300;text-align:left;padding-bottom:30px'>You can accept Subscriber request by clicking Accept button. </p></li><li style='text-align:center'> <a href=" +
        link2 +
        " style='border-bottom:1px solid #5293BD;font-size:16px;font-weight:300;text-decoration:none;color:#5293BD'>See all requests</a> </li></ul> <div style='text-align:center;margin-top:24px;'> <ul style='list-style:none; margin:0;padding:0'> <li style='text-align:center'> <a href='" +
        unsubscribe_url +
        "' style='font-size:11px;font-weight:400;color:#111111;text-decoration:underline'>Unsubscribe from email notification | Help</a> </li><li style='padding:22px 0 0 0'> <p style='color:#989898;font-size:11px;font-weight:300;'>You are receiving Subscription emails<br>This email is intended to " +
        recipientName +
        "</p></li><li style='padding:30px 0 0 0'> <img src='" +
        down_logo +
        "' alt=''> <p style='color:#989898;font-size:11px;font-weight:300;padding-top:8px;'>Contact admin@trunums.com for any queries</p></li></ul> </div></div></div></body></html>"
        );
    };
    var data = {
        from: "truNums <admin@trunums.com>",
        to: tomail,
        subject: senderName + " has sent you a subscriber request ",
        html: invite()
    };
    mailgun.messages().send(data, function(error, body) {
        if (body) {
        var SubscriptionObj = new Subscription();
        SubscriptionObj.subscribee = ObjectId(req.body.recipientid);
        SubscriptionObj.subscriber = ObjectId(req.body.senderid);
        SubscriptionObj.status = "PENDING";
        SubscriptionObj.feedoption = "start";
        if (req.body.privateSiteId !== null) {
            SubscriptionObj.privateSiteId = ObjectId(req.body.privateSiteId);
        }
        SubscriptionObj.save((err, data) => {
            res.json(data);
        });
        } else {
        res.json({
            result: false,
            message:
            "Unable to Verify Mail Address Places Check Your Mail Adderess."
        });
        }
    });
};

subscriptionController.acceptsubcriber = (req, res, next) => {
    var link = req.headers.origin + "/userprofile/" + req.body.senderUserName;
    var link2 = req.headers.origin + "/subscribers/";
    var unsubscribe_url = req.headers.origin + "/subscribers/";
    var img = req.headers.origin + "/assets/images/logo.png";
    var down_logo = req.headers.origin + "/assets/images/logo.png";
    var map_img = req.headers.origin + "/assets/images/images/mapicon.png";
    var recipientName = req.body.recipientname;
    var recipientId = req.body.recipientid;
    var senderId = req.body.senderid;
    var senderName = req.body.sendername;
    var country = req.body.country;
    var tomail = req.body.tomail;
    var profile_pic = req.body.profilePicture;
    var invite = function () {
        return (
        "<html lang='en'><head> <meta charset='UTF-8'> <meta name='viewport' content='width=device-width, initial-scale=1.0'> <meta http-equiv='X-UA-Compatible' content='ie=edge'> <title>Email-html</title> <link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700' rel='stylesheet'> <style>body{background: #EEEEEE; text-align: center; font-family: 'Roboto', sans-serif}</style></head><body> <div style='background:#EEEEEE;float:left;width:100%;height:100%'><div style='max-width:680px;display:block;margin:20px auto;padding:10px;'> <ul style='margin:0;padding:0;list-style-type:none;background:#FFF;border-radius:6px;'> <li style='padding:25.5px 85px;text-align:center;'> <img src=" +
        img +
        "> </li></ul> <ul style='margin-top:8px;padding:34px 87px 28px 87px;list-style-type:none;background:#FFF;border-radius:3px;'> <li> <h4 style='font-size:20px;font-weight:400;letter-spacing:1px;line-height:22px;color:#000000;text-align:left'>Hi " +
        recipientName +
        ",<br/> " +
        senderName +
        " has accepted your invitation!</h4> </li><li> <ul style='margin:0;padding:13px 0px 15px 0px;background:#F5F5F5;list-style-type:none;border-top:1px solid #CCCCCC;border-bottom:1px solid #CCCCCC;float: left;width: 100%;'> <li style='float:left;margin:6px 0 0 22px'> <img src='" +
        profile_pic +
        " ' alt=' ' height='44px' width='45px' style='border-radius:50%'> </li><li style='float:left;position:relative;margin:10px 0px 0 15px'> <p style='margin:0;font-size:14px;color:#1E1E1E;font-weight:400;text-transform:capitalize'>" +
        senderName +
        "</p><p style='margin:0;font-size:12px;color:#1E1E1E;font-weight:400;line-height:22px;text-align:left;padding-top:5px'><img src='" +
        map_img +
        "' alt='location' style='position:relative;top:2px;'>  " +
        country +
        "</p></li><li style='float:right;padding:18px 24px 12px 2px'> <a href=" +
        link +
        " style='color:#FFF;background:#5293BD;padding:9px 20px;text-decoration:none;font-size:14px;font-weight:300'> View Profile</a> </li></ul> </li><li style='float: left;width: 100%;'> <p style='color:#909090;font-size:12px;font-weight:300;text-align:left;padding-bottom:30px'>You can accept Subscriber request by clicking Accept button. </p></li><li style='text-align:center'> <a href=" +
        link2 +
        " style='border-bottom:1px solid #5293BD;font-size:16px;font-weight:300;text-decoration:none;color:#5293BD'>See all requests</a> </li></ul> <div style='text-align:center;margin-top:24px;'> <ul style='list-style:none; margin:0;padding:0'> <li style='text-align:center'> <a href='" +
        unsubscribe_url +
        "' style='font-size:11px;font-weight:400;color:#111111;text-decoration:underline'>Unsubscribe from email notification | Help</a> </li><li style='padding:22px 0 0 0'> <p style='color:#989898;font-size:11px;font-weight:300;'>You are receiving Subscription emails<br>This email is intended to " +
        senderName +
        "</p></li><li style='padding:30px 0 0 0'> <img src='" +
        down_logo +
        "' alt=''> <p style='color:#989898;font-size:11px;font-weight:300;padding-top:8px;'>Contact admin@trunums.com for any queries</p></li></ul> </div></div></div></body></html>"
        );
    };
    var data = {
        from: "truNums <admin@trunums.com>",
        to: tomail,
        subject: senderName + " has accepted your subscription request ",
        html: invite()
    };
    mailgun.messages().send(data, function (error, body) {
        if (body) {
        Subscription.findByIdAndUpdate(
            ObjectId(req.body.subscriptionid),
            {
            $set: {
                status: "ACCEPTED"
            }
            },
            {
            new: true
            },
            (err, status) => {
            if (status) {
                res.json({
                result: true
                });
            } else {
                res.json({
                result: false
                });
            }
            }
        );
        } else {
        res.json({
            result: false,
            message:
            "Unable to Verify Mail Address Places Check Your Mail Adderess."
        });
        }
    });
};

subscriptionController.acceptautomaticsubcriber = (req, res, next) => {
    Subscription.findByIdAndUpdate(
        ObjectId(req.params.id),
        {
          $set: {
            status: "ACCEPTED"
          }
        },
        {
          new: true
        },
        (err, status) => {
          if (status) {
            res.json({
              result: true
            });
          } else {
            res.json({
              result: false
            });
          }
        }
      );
};

subscriptionController.sendSubscribeInvivatiions = (req, res, next) => {
    var recipients = req.body.recipients;
    var recipientsData = req.body.recipientsData;
    var userData = req.body.userData;
    var isTrunumsUser = req.body.isTrunumsUser;
    var recipientVars = {};
    var insertDocs = [];
    for (var i = 0; i < recipients.length; i++) {
        var singleDoc = {
        userId: userData.userId,
        email: recipients[i],
        isTrunumUser: isTrunumsUser
        };
        insertDocs.push(singleDoc);
        if (isTrunumsUser) {
        recipientVars[recipients[i]] = {
            id: i,
            firstName: userData.firstName,
            lastName: userData.lastName,
            userName: userData.userName,
            OtherfirstName: recipientsData[i].firstName,
            OtherlastName: recipientsData[i].lastName
        };
        } else {
        recipientVars[recipients[i]] = {
            id: i,
            firstName: userData.firstName,
            lastName: userData.lastName,
            userName: userData.userName
        };
        }
    }
    var webUrl = req.headers.origin + "/userprofile/" + userData.userName;
    var img = req.headers.origin + "/assets/images/logo.png";
    var down_logo = req.headers.origin + "/assets/images/logo.png";
    var data;
    if (isTrunumsUser) {
        data = {
        from: "truNums<admin@trunums.com>",
        to: recipients,
        subject:
            " %recipient.firstName% %recipient.lastName% has invited you to subscribe on truNums ",
        html:
            "<html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><meta http-equiv='X-UA-Compatible' content='ie=edge'><title>Email-html</title><link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700' rel='stylesheet'><style>body{font-family:'Roboto',sans-serif;text-align:center;background:#EEE;margin:0;padding:0}</style></head><body><div style='background:#EEEEEE;float:left;width:100%;height:100%'><div style='max-width:680px;display:block;margin:20px auto;padding:10px'><ul style='list-style:none; margin:0; padding:0;background:#FF7F09;border-top-left-radius: 6px;border-top-right-radius: 6px;'><li style=' text-align:center; padding:29.5px'> <img src='" +
            img +
            "' alt='images' srcset=''></li></ul><ul style='list-style:none; margin:0; padding:37px 79px 46px 87px;background:#FFFFFF;border-bottom-left-radius: 6px;border-bottom-right-radius: 6px;'><li style='text-align:left'><h2 style='font-size:32px;font-weight:400;color:#757575;'> %recipient.firstName% %recipient.lastName% has invited you to subscribe on truNums</h2></li><li style='text-align:left'><p style='font-size:14px;font-weight:300;color:#9F9F9F;line-height:20px;font-weight:300'>Hi %recipient.OtherfirstName% %recipient.OtherlastName%,<br/><br/>As a mutual user of trunums platform I would like to invite you to subscribe to my polls/topics. I would like your to get your valuable feedback on the various polls I have created and will be continuing to create. Please click on the link below to subscribe to my polls/topics.</p></li><li style='text-align:left;padding-top:40px'> <a href='" +
            webUrl +
            "type='submit' style='text-transform:uppercase;background:#000000;color:#FFFFFF;font-size:16px;font-weight:300;letter-spacing:1px;padding:10px;cursor:pointer;text-decoration:none;'>Accept invite</a></li></ul><div style='text-align:center;margin-top:24px;'><ul style='list-style:none; margin:0;padding:0'><li> <a href='" +
            webUrl +
            "' style='font-size:11px;font-weight:400;color:#111111;text-decoration:underline'>Unsubscribe from email notification | Help</a></li><li style='padding:22px 0 0 0'><p style='color:#989898;font-size:11px;font-weight:300;'>You are receiving Subscription emails<br>This email is intended to Jonathon Greeves</p></li><li style='padding:30px 0 0 0'> <img src='" +
            down_logo +
            "' alt='images'><p><a href='' style='color:#989898;font-size:11px;font-weight:300;padding-top:8px;text-decoration:none'> Contact admin@trunums.com for any queries</a></p></li></ul></div></div></div></body></html>",
        "recipient-variables": recipientVars
        };
        mailgun.messages().send(data, function (error, body) {
        if (body) {
            invitations.insertMany(insertDocs, (err, invites) => {
            res.send(invites);
            });
        } else {
            res.send(error);
        }
        });
    } else {
        data = {
        from: "truNums<admin@trunums.com>",
        to: recipients,
        subject:
            "%recipient.firstName% %recipient.lastName% has invited you to subscribe on truNums ",
        html:
            "<html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><meta http-equiv='X-UA-Compatible' content='ie=edge'><title>Email-html</title><link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700' rel='stylesheet'><style>body{font-family:'Roboto',sans-serif;text-align:center;background:#EEE;margin:0;padding:0}</style></head><body><div style='background:#EEEEEE;float:left;width:100%;height:100%'><div style='max-width:680px;display:block;margin:20px auto;padding:10px'><ul style='list-style:none; margin:0; padding:0;background:#FF7F09;border-top-left-radius: 6px;border-top-right-radius: 6px;'><li style=' text-align:center; padding:29.5px'> <img src='" +
            img +
            "' alt='images' srcset=''></li></ul><ul style='list-style:none; margin:0; padding:37px 79px 46px 87px;background:#FFFFFF;border-bottom-left-radius: 6px;border-bottom-right-radius: 6px;'><li style='text-align:left'><h2 style='font-size:32px;font-weight:400;color:#757575;'> %recipient.firstName% %recipient.lastName% has invited you to subscribe on truNums</h2></li><li style='text-align:left'><p style='font-size:14px;font-weight:300;color:#9F9F9F;line-height:20px;font-weight:300'>Hi,<br/><br/> I would like to invite you to join the trunums platform to help in disseminating the truth to all the people of the world.<br/><br/>A brief description of trunums.com<br/><br/>trunums.com is a social media platform designed to allow users to post topics and polls, target it to a country and get people to give feedback by choosing any of the options that the poll allows. The polls are classified into three buckets namely trending, latest and top. Users can vote, comment and  follow a poll to receive broadcast messages from by the poll creator. A user can also subscribe to any other user to get the polls created by them in their feed. trunums enables a unique two way picture of the social media where the focus can be switched from topics to the user who has created the topics. </p></li><li style='text-align:left;padding-top:40px'> <a href='" +
            webUrl +
            "type='submit' style='text-transform:uppercase;background:#000000;color:#FFFFFF;font-size:16px;font-weight:300;letter-spacing:1px;padding:10px;cursor:pointer;text-decoration:none;'>Accept invite</a></li></ul><div style='text-align:center;margin-top:24px;'><ul style='list-style:none; margin:0;padding:0'><li> <a href='' style='font-size:11px;font-weight:400;color:#111111;text-decoration:underline'>Unsubscribe from email notification | Help</a></li><li style='padding:22px 0 0 0'><p style='color:#989898;font-size:11px;font-weight:300;'>You are receiving Subscription emails<br>This email is intended to Jonathon Greeves</p></li><li style='padding:30px 0 0 0'> <img src='" +
            down_logo +
            "' alt='images'><p><a href='' style='color:#989898;font-size:11px;font-weight:300;padding-top:8px;text-decoration:none'> Contact admin@trunums.com for any queries</a></p></li></ul></div></div></div></body></html>",
        "recipient-variables": recipientVars
        };
        mailgun.messages().send(data, function (error, body) {
        if (body) {
            invitations.insertMany(insertDocs, (err, invites) => {
            res.send(invites);
            });
        } else {
          res.send(error)
        }
        });
    }
};

subscriptionController.getUserProfileSubscrption = (req, res, next) => {
    Subscription.aggregate(
        [
          {
            $match: {
              subscriber: ObjectId(req.body.id)
            }
          },
          {
            $match: {
              status: {
                $nin: ["UNSUBSCRIBE"]
              }
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
                userid: "$subscribee"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$userid"]
                        },
                        {
                          $eq: ["$address.country", "$$country"]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    firstName: 1,
                    lastName: 1,
                    userName: 1,
                    userStatus: 1,
                    address: 1,
                    profilePicture: 1,
                    id: 1
                  }
                }
              ],
              as: "subscribee"
            }
          },
          {
            $unwind: "$subscribee"
          }
        ],
        (err, data) => {
          if (err) {
            res.json(err);
          } else {
            res.json(data);
          }
        }
      ); 
};
module.exports = subscriptionController;
