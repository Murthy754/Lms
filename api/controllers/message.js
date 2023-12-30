const { ObjectId } = require("mongodb");
var Message = require("../models/Message");
var Subscription = require("../models/Subscription");
var MessageSubscription = require("../models/MessageSubscription");
var Group = require("../models/Groups")
var values = require("../config/values");
var api_key = values.values.MAILGUN_API_KEY;
var domain = values.values.MAILGUN_DOMAIN_TEMP;

var mailgun = require("mailgun-js")({
  apiKey: api_key,
  domain: domain
});
messageController = () => { };

// Gets all the private site subscribers
messageController.getPrivateSiteSubscribers = (req, res, next) => {
    return MessageSubscription.aggregate(
        [
          {
            $match: {
              requestedTo: ObjectId(req.body.userId)
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
                userid: "$requestedBy"
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
                    address: 1,
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    messagePermission: 1,
                    privateSite: 1,
                    onlineStatus: 1,
                    profilePicture: 1,
                    userName: 1,
                    userStatus: 1
                  }
                }
              ],
              as: "user"
            }
          },
          {
            $unwind: "$user"
          }
        ], (err, data) => {
          if (err) {
            res.status(404).json(err);
          } else {
            res.status(200).json(data);
          }
        }
      )
};

messageController.getOwner = (req, res, next) => {
    return MessageSubscription.aggregate(
        [
          {
            $match: {
              requestedBy: ObjectId(req.body.id)
            }
          },
          {
            $match: {
              requestedTo: ObjectId(req.body.privateSiteId)
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
              from: "virtualID",
              let: {
                vID: "$privateSiteId"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$vID"]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    ownerId: 1
                  }
                }
              ],
              as: "virtualUser"
            }
          },
          {
            $unwind: "$virtualUser"
          },
          {
            $lookup: {
              from: "user",
              let: {
                userid: "$virtualUser.ownerId"
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
                    address: 1,
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    messagePermission: 1,
                    privateSite: 1,
                    onlineStatus: 1,
                    profilePicture: 1,
                    userName: 1,
                    userStatus: 1
                  }
                }
              ],
              as: "user"
            }
          },
          {
            $unwind: "$user"
          }
        ], (err, data) => {
          if (err) {
            res.status(404).json(err);
          } else {
            res.status(200).json(data);
          }
        }
      )
};

// Gets other subscribers of site for messaging
messageController.getOtherSubscribersForMessaging = (req, res, next) => {
    return Subscription.aggregate(
        [
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
                    onlineStatus: 1,
                    id: 1,
                    privateSite:1,
                    privateSiteSettings:1
                  }
                }
              ],
              as: "user"
            }
          },
          {
            $unwind: "$user"
          }
        ], (err, data) => {
          if (err) {
            res.status(404).json(err);
          } else {
            res.status(200).json(data);
          }
        }
      );
};

messageController.acceptAutomaticMessageRequest = (req, res, next) => {
    var messageSubscription = new MessageSubscription();
    messageSubscription.requestedTo = ObjectId(req.body.recipientid);
    messageSubscription.requestedBy = ObjectId(req.body.senderid);
    messageSubscription.privateSiteId = ObjectId(req.body.privateSiteId);
    messageSubscription.status = "ACCEPTED";
    messageSubscription.save((err, data) => {
      if (err) {
        res.status(404).json(err);
      } else {
        res.status(200).json(data)
      }
    });
};

messageController.getMessagesBetweenMembersInPrivateSite = (req, res, next) => {
    Message.aggregate(
        [
          {
            $match: {
              $or: [
                {
                  sendTo: ObjectId(req.params.id)
                }, {
                  sendTo: ObjectId(req.params.userId)
                }
            ]
            }
          },
          {
            $match: {
              $or: [
                {
                  createdBy: ObjectId(req.params.id)
                }, {
                  createdBy: ObjectId(req.params.userId)
                }
            ]
            }
          },
          {
            $match: {
              privateSiteId: ObjectId(req.params.siteId)
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
                userid: "$createdBy"
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
              as: "user"
            }
          },
          {
            $unwind: "$user"
          },
          {
            $lookup: {
              from: "user",
              let: {
                memberid: ObjectId(req.params.id)
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$memberid"]
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
              as: "member"
            }
          },
          {
            $unwind: "$member"
          }
        ], (err, data) => {
          if (err) {
            res.status(404).json(err);
          } else {
            res.status(200).json(data);
          }
        }
      );
}

messageController.removeMessageSubscription = (req, res, next) => {
  MessageSubscription.deleteMany(
    {
      "privateSiteId": ObjectId(req.body.privateSiteId),
      $or: [
        { requestedBy: ObjectId(req.body.requestedBy) },
        { requestedTo: ObjectId(req.body.requestedBy) }
      ]
    }
  ).exec((err, doc) => {
    if(err) {
      res.json({
        success: false,
        message: "Server side error occcurred"
      });
      return;
    }
    res.json({ result: true });
  })
};

// Gets Message subscription between users
messageController.getMessageSubscriptionStatus = (req, res, next) => {
  var siteValue = null;
  if (req.query.privateSiteId !== 'null') {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  MessageSubscription.aggregate([{
    $match: {
      $or: [{
        requestedTo: ObjectId(req.params.id),
        requestedBy: ObjectId(req.params.userProfileId)
      }, {
        requestedTo: ObjectId(req.params.userProfileId),
        requestedBy: ObjectId(req.params.id)
      }],
      $and: [{
        privateSiteId: siteValue
      }]
    }
  }]).exec((error, doc) => {
    if (error) {
      res.json({ result: false, error: error });
    } else {
      if (doc.length > 0) {
        res.json({ result: true, messageSubscription: doc[0] });        
      } else {
        res.json({ result: true });
      }
    }
  });
};

// Removes mesage subscription
messageController.removeMessaging = (req, res, next) => {
  let messageObjectId = req.body.messageSubscriptionObjId;
  MessageSubscription.findByIdAndRemove(ObjectId(messageObjectId)).exec((error, doc) => {
    if (doc) {
      res.status(200).json({ result: true, message: "Subscription removed" });
    } else {
      res.json({ reult: false, error: error });
    }
  });
};

messageController.createMessage = (req, res, next) => {
  var message = new Message(req.body);
  message.save((err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
};

messageController.updateMessage = (req, res, next) => {
  Message
    .update(
      { _id: ObjectId(req.params.id) },
      {
        $push: { likedBy: req.body.userId },
        $inc: { likeCount: 1 }
      },

    )
    .exec((err, data) => {
      if (err) {
        res.json(err);
      } else {
        res.json(data);
      }
    });
};

messageController.updateBlock = (req, res, next) => {
  if (req.body.params.updates[1].value === false ) {
    MessageSubscription.updateOne(
      { _id: ObjectId(req.body.params.updates[0].value) },
      {
        $set: {
          isBlocked: !req.body.params.updates[1].value,
          blockedBy: req.body.params.updates[2].value
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
    MessageSubscription.updateOne(
      { _id: ObjectId(req.body.params.updates[0].value) },
      {
        $set: {
          isBlocked: !req.body.params.updates[1].value,
          blockedBy: null
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
  }
};

messageController.forwardMessage = (req, res, next) => {
  const forwardTo = req.body.forwardTo;
  Message
    .findById({ _id: ObjectId(req.body.messageId) })
    .exec((err, data) => {
      var insertDocs = [];
      for (var i = 0; i < forwardTo.length; i++) {
        if (data !== null) {
          var singleDoc = {
            // createdBy:data.createdBy,
            createdBy: req.body.forwardedBy,
            // forwardedBy:req.body.forwardedBy,
            cretaedAt: Date.now(),
            message: data.message,
            files: data.files,
            groupId: null,
            replyFor: null,
            sendTo: ObjectId(forwardTo[i]),
          };
          insertDocs.push(singleDoc);
        }  
      }
      Message.insertMany(insertDocs, (err, data) => {
        if (err) {
          res.json(err);
        } else {
          res.json(data);
        }
      });
    })
};

messageController.userSubscription = (req, res, next) => {
  MessageSubscription.find({
    requestedTo: ObjectId(req.body.id),
    requestedBy: ObjectId(req.body.userid)
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
    }
  });
};

messageController.sendMessageRequest = (req, res, next) => {
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
      ",<br/>you have a new message request!</h4> </li><li> <ul style='margin:0;padding:13px 0px 15px 0px;background:#F5F5F5;list-style-type:none;border-top:1px solid #CCCCCC;border-bottom:1px solid #CCCCCC;float: left;width: 100%;'> <li style='float:left;margin:6px 0 0 22px'> <img src='" +
      profile_pic +
      " ' alt=' ' height='44px' width='45px' style='border-radius:50%'> </li><li style='float:left;position:relative;margin:10px 0px 0 15px'> <p style='margin:0;font-size:14px;color:#1E1E1E;font-weight:400;text-transform:capitalize'>" +
      senderName +
      "</p><p style='margin:0;font-size:12px;color:#1E1E1E;font-weight:400;line-height:22px;text-align:left;padding-top:5px'><img src='" +
      map_img +
      "' alt='location' style='position:relative;top:2px;' >  " +
      country +
      "</p></li><li style='float:right;padding:18px 24px 12px 2px'> <a href=" +
      link +
      " style='color:#FFF;background:#5293BD;padding:9px 20px;text-decoration:none;font-size:14px;font-weight:300'> View Request</a> </li></ul> </li><li style='float: left;width: 100%;'> <p style='color:#909090;font-size:12px;font-weight:300;text-align:left;padding-bottom:30px'>You can accept Message request by clicking Accept button. </p></li><li style='text-align:center'> <a href=" +
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
    subject: senderName + " has sent you a message request ",
    html: invite()
  };
  mailgun.messages().send(data, function (error, body) {
    if (body) {
      var SubscriptionObj = new MessageSubscription();
      SubscriptionObj.requestedTo = ObjectId(req.body.recipientid);
      SubscriptionObj.requestedBy = ObjectId(req.body.senderid);
      SubscriptionObj.status = "PENDING";
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

messageController.getAllMessages = (req, res, next) => {
  Message.aggregate(
    [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            userid: "$createdBy"
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
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "groups",
          let: {
            groupid: "$groupId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$groupid"]
                }
              }
            },
            {
              $project: {
                groupName: 1,
                id: 1,
                groupMembers: 1
              }
            }
          ],
          as: "group"
        }
      },
      {
        $unwind: "$group"
      }
    ],
    (err, data)  => {
      if (err) {
        res.json(err);
      } else {
        res.json(data);
      }
    }
  );
};

messageController.getMessages = (req, res, next) => {
  Message.aggregate(
    [
      {
        $match: {
          groupId: ObjectId(req.params.id)
        }
      },
      {
        $match: {
          isDeleted: false
        }
      },

      {
        $lookup: {
          from: "user",
          let: {
            userid: "$createdBy"
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
                id: 1,
                onlineStatus: 1
              }
            }
          ],
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "groups",
          let: {
            groupid: "$groupId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$groupid"]
                }
              }
            },
            {
              $project: {
                groupName: 1,
                id: 1,
                groupMembers: 1
              }
            }
          ],
          as: "group"
        }
      },
      {
        $unwind: "$group"
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

messageController.getMessageUsers = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  MessageSubscription.aggregate(
    [
      {
        $match: {
          requestedBy: ObjectId(req.body.id),
          status: {
            $eq: "ACCEPTED"
          }
        }
      },
      {
        $match: {
          privateSiteId: siteValue
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            userid: "$requestedTo",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$userid"]
                    },
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
                privateSite: 1,
                profilePicture: 1,
                email: 1,
                id: 1,
                onlineStatus: 1,
                messagePermission: 1
              }
            }
          ],
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },


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

messageController.getMessageUsersBy = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  MessageSubscription.aggregate(
    [
      {
        $match: {
          requestedTo: ObjectId(req.body.id),
          status: {
            $eq: "ACCEPTED"
          }
        }
      },
      {
        $match: {
          privateSiteId: siteValue
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            userid: "$requestedBy",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$userid"]
                    },
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
                privateSite: 1,
                profilePicture: 1,
                email: 1,
                id: 1,
                onlineStatus: 1,
                messagePermission: 1
              }
            }
          ],
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },


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

messageController.deleteGroupMessages = (req, res, next) => {
  Message.update(
    { groupId: ObjectId(req.body.id) },
    {
      $set: {
        isDeleted: true
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

messageController.deleteMessage = (req, res, next) => {
  Message.updateOne(
    { _id: ObjectId(req.body.id) },
    {
      $set: {
        isDeleted: true
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

messageController.deleteGroup = (req, res, next) => {
  Group.update(
    { _id: ObjectId(req.body.id) },
    {
      $set: {
        isDeleted: true
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

messageController.getMessagesBetweenMembers = (req, res, next) => {
  Message.aggregate(
    [
      {
        $match: {
          $or: [{
            sendTo: ObjectId(req.params.id)
          }, {
            sendTo: ObjectId(req.params.userId)
          }],
          $and: [{
            privateSiteId: null
          }]
        }
      },
      {
        $match: {
          $or: [{
            createdBy: ObjectId(req.params.id)
          }, {
            createdBy: ObjectId(req.params.userId)
          }]
        }
      },

      {
        $lookup: {
          from: "user",
          let: {
            userid: "$createdBy"
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
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "user",
          let: {
            memberid: ObjectId(req.params.id)
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$memberid"]
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
          as: "member"
        }
      },
      {
        $unwind: "$member"
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

messageController.leaveGroup = (req, res, next) => {
  if (req.body.admin) {
    Group.
    update(
      { _id: ObjectId(req.body.id) },
      {
        $pull: { admins: req.body.userId }
      },
      {
        new: true
      }
    ).exec((err, status) => {
        if (status) {
          res.json({
            result: true
          });
        } else {
          res.json({
            result: false
          });
        }
    });
  } else {
    Group.
    update(
      { _id: ObjectId(req.body.id) },
      {
        $pull: { groupMembers: { _id: req.body.userId}}
      },
      {
        new: true
      }
    ).exec((err, status) => {
        if (status) {
          res.json({
            result: true
          });
        } else {
          res.json({
            result: false
          });
        }
    });
  }
};

messageController.searchMessages = (req, res, next) => {
  var data = ".*" + req.body.searchParam + ".*";
  Message.aggregate(
    [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $match: {
          message: { $regex: data, $options: "i" }
        }
      },

      {
        $lookup: {
          from: "user",
          let: {
            userid: "$createdBy"
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
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "groups",
          let: {
            groupid: "$groupId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$groupid"]
                }
              }
            },
            {
              $project: {
                groupName: 1,
                id: 1,
                groupMembers: 1
              }
            }
          ],
          as: "group"
        }
      },
      {
        $unwind: "$group"
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

messageController.getMessageRequestByCountry = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  MessageSubscription.aggregate(
    [
      {
        $match: {
          requestedTo: ObjectId(req.body.id)
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
            userid: "$requestedBy",
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
                privateSite: 1,
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
      },
    ], (err, data) => {
      if (err) {
        res.json(err);
      } else {
        res.json(data);
      }
    }
  );
};

messageController.getSentRequestByCountry = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  MessageSubscription.aggregate(
    [
      {
        $match: {
          requestedBy: ObjectId(req.body.id)
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
            userid: "$requestedTo",
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
                privateSite: 1,
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

messageController.getAllMessageRequest = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  MessageSubscription.aggregate(
    [
      {
        $match: {
          requestedTo: ObjectId(req.body.id)
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
            userid: "$requestedBy"
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
                privateSite: 1,
                privateSiteSettings: 1
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

messageController.getAllSentMessageRequest = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  MessageSubscription.aggregate(
    [
      {
        $match: {
          requestedBy: ObjectId(req.body.id)
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
            userid: "$requestedTo"
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
                privateSite: 1,
                privateSiteSettings: 1
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

messageController.updateMessageRequestStatus = (req, res, next) => {
  MessageSubscription.findByIdAndUpdate(
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

messageController.acceptMessageRequest = (req, res, next) => {
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
    subject: senderName + " has accepted your message request ",
    html: invite()
  };
  mailgun.messages().send(data, function (error, body) {
    if (body) {
      MessageSubscription.findByIdAndUpdate(
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

module.exports = messageController;