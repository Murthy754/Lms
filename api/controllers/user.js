const { ObjectId } = require("mongodb");
const Subscription = require("../models/Subscription");
const values = require('../config/values');
const privateSite = require("../models/Privatesite");
const client = require('twilio')(values.values.twilioSid, values.values.twilioAuthToken);
const user = require('../models/User');
const VirtualID = require("../models/VirtualID");

userController = () => { };

userController.getprivatesiteusers = (req, res, next) => {
    Subscription.aggregate([
        {
          $match: {
            privateSiteId: ObjectId(req.params.id)
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
                  profilePicture: 1,
                  lastName: 1,
                  id: 1,
                  address: 1,
                  email: 1,
                  userName: 1,
                  privateSite:1,
                  privateSiteSettings:1
                }
              }
            ],
            as: "user"
          },
        },
        {
          $unwind: "$user"
        }
      ]).exec((err, data) => {
        if (!err) {
          var dataLength = data.length;
          var result = [];
          for(var i = 0; i < dataLength; i++) {
            result.push(data[i].user);
          }
          res.status(200).json(result);
        } else {
          res.status(500).json({
            success: false,
            message: "Server side error occcurred"
          })
        }
      })
};

userController.sendOtp = (req, res, next) => {
  if (req.body.attempt === "first" && !req.body.privateSiteDetails.privateSite) { // When the user verification attempt is first time and not private site user
    console.log("First and " + req.body.privateSite);
    let query = {
      "phone": req.body.number,
      "phoneVerified": true
    }
    user.find(query).exec((error, doc) => {
      if (doc.length > 0) {
        res.json({ "result": false, "error": "Number already in use" });
      } else {
        let otpCode = Math.floor(100000 + Math.random() * 900000);
        client.messages.create({
           body: 'OTP for Trunums phone verification is ' + otpCode,
           from: "+" + values.values.twilioPhoneNumber,
           to: req.body.number
         })
        .then(message => 
          user.findByIdAndUpdate(
            ObjectId(req.body.userId),
            {
              $set: {
                phone: req.body.number,
                phoneTokenId: otpCode
              }
            },
            {
              new: true
            },
            (err, data) => {
              (err)? res.json({ "result": false, "error": err }) : res.status(200).json({ "result": true, "data": data })
            })
        ).catch(error => {
          res.json({ "result": false, "error": error.message });
        });
      }
    });
  } else if (req.body.attempt === "first" && req.body.privateSiteDetails.privateSite) { // When the user verification attempt is first time and private site user
   user.find({
    verifiedNumbersList: {
      $elemMatch: {
        phone: req.body.number,
        phoneVerified: true,
        privateSiteId: req.body.privateSiteDetails.privateSiteId
      }
    }
   }).exec((error, doc) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Server side error occcurred"
        });
      } else {
        if (doc.length > 0) {
          res.json({ "result": false, "error": "Number already in use" });
        } else {
          // Send otp
          let otpCode = Math.floor(100000 + Math.random() * 900000);
          let numberDetails = {
            phone: req.body.number,
            phoneVerified: false,
            privateSiteId: req.body.privateSiteDetails.privateSiteId,
            phoneTokenId: otpCode.toString()
          }
          client.messages.create({
            body: 'OTP for Trunums phone verification is ' + otpCode,
            from: "+" + values.values.twilioPhoneNumber,
            to: req.body.number
          })
          .then(message => 
            user.findOneAndUpdate(
              {
                "_id":  ObjectId(req.body.userId)
              },
              {
                $addToSet: {
                  "verifiedNumbersList": numberDetails
                }
              },
              {
                new: true
              },
              (err, data) => {
                (err)? res.json({ "result": false, "error": err }) : res.status(200).json({ "result": true, "data": data })
              })
          ).catch(error => {
            res.json({ "result": false, "error": error.message });
          });
        }
      }
   });
  } else if (req.body.attempt === "second" && req.body.privateSiteDetails.privateSite) {
    let otpCode = Math.floor(100000 + Math.random() * 900000);
    client.messages.create({
       body: 'OTP for Trunums phone verification is ' + otpCode,
       from: "+" + values.values.twilioPhoneNumber,
       to: req.body.number
     })
    .then(message => 
        user.findOneAndUpdate(
          { _id: req.body.userId,
            "verifiedNumbersList": {
              "$elemMatch": { "phone": req.body.number, "privateSiteId": req.body.privateSiteDetails.privateSiteId }
            } 
          },
          {
            $set: {
              "verifiedNumbersList.$.phoneTokenId": otpCode.toString() 
            } 
          },
          { 
            new: true
          }
        ).exec((err, data) => {
          (err)? res.json({ "result": false, "error": err }) : res.status(200).json({ "result": true, "data": data })
        })
    ).catch(error => {
      res.json({ "result": false, "error": error.message });
    }); 
  } else {
    let otpCode = Math.floor(100000 + Math.random() * 900000);
    client.messages.create({
       body: 'OTP for Trunums phone verification is ' + otpCode,
       from: "+" + values.values.twilioPhoneNumber,
       to: req.body.number
     })
    .then(message => 
      user.findByIdAndUpdate(
        ObjectId(req.body.userId),
        {
          $set: {
            phone: req.body.number,
            phoneTokenId: otpCode
          }
        },
        {
          new: true
        },
        (err, data) => {
          (err)? res.json({ "result": false, "error": err }) : res.status(200).json({ "result": true, "data": data })
        })
    ).catch(error => {
      res.json({ "result": false, "error": error.message });
    }); 
  }
  
};

userController.sendOtpToSignUp = (req, res, next) => {
  if (req.body.attempt === "first" && !req.body.privateSiteDetails.privateSite) { // When the user verification attempt is first time
    console.log("First and " + req.body.number);
    let query = {
      "phone": req.body.number,
      "phoneVerified": true
    }
    user.find(query).exec((error, doc) => {
      if (doc.length > 0) {
        res.json({ "result": false, "error": "Number already in use" });
      } else {
        let otpCode = Math.floor(100000 + Math.random() * 900000);
        client.messages.create({
           body: 'OTP for Trunums phone verification is ' + otpCode,
           from: "+" + values.values.twilioPhoneNumber,
           to: req.body.number
         }).then((message) => {
          res.status(200).json({ "result": true, "phone": req.body.number, "otp": otpCode })
        }).catch(error => {
          res.json({ "result": false, "error": error.message });
        });
      }
    });
  } 
  else {
    let otpCode = Math.floor(100000 + Math.random() * 900000);
    client.messages.create({
       body: 'OTP for Trunums phone verification is ' + otpCode,
       from: "+" + values.values.twilioPhoneNumber,
       to: req.body.number
     })
    .then((message) => {
        res.status(200).json({ "result": true, "phone": req.body.number, "otp": otpCode })
      }).catch(error => {
      res.json({ "result": false, "error": error.message });
    }); 
  }
  
};

userController.submitOtp = (req, res, next) => {
  if (req.body.privateSiteDetails.privateSite) {
    user.update(
    {
      "_id": ObjectId(req.body.userId),
      "verifiedNumbersList": {
        "$elemMatch": {
          "phoneTokenId": req.body.otp,
          "privateSiteId": req.body.privateSiteDetails.privateSiteId,
          "phone": req.body.phone
        }
      }
    },
    {
      "$set": { "verifiedNumbersList.$.phoneVerified": true } 
    }).exec((error, doc) => {
      if (doc.n === 1) {
        res.json({
          result: true,
          message: "OTP verification successfully"
        });
      } else {
        res.json({
          result: false,
          message: "OTP is incorrect. Try resend OTP."
        });
      }
    })
  } else {
    user.findOneAndUpdate(
      {
        phone: req.body.phone,
        phoneTokenId: req.body.otp
      },
      {
        $set: {
          phoneVerified: true
        }
      },
      {
        new: true
      }, (error, document) => {
        if (document) {
          res.json({
            result: true,
            message: "OTP verification successfully"
          });
        } else {
          res.json({
            result: false,
            message: "OTP is incorrect. Try resend OTP."
          });
        }
      }
    )
  }
};

userController.deleteNumber = (req, res, next) => {
  let userId = req.body.userId;
  if (req.body.privateSite) {
    user.findByIdAndUpdate(
      ObjectId(userId),
      {
        $pull: {
          "verifiedNumbersList": {
            "phone": req.body.phone
          } 
        }
      },
      {
        new: true
      }
    ).exec((err, doc) => {
      (err) ? res.status(500).json(err) : res.status(200).json({ result: true });
    })
  } else {
    user.findByIdAndUpdate(
      ObjectId(userId),
      {
        $set: {
          "phone": null,
          "phoneVerified": false,
          "phoneTokenId": ""
        }
      },
      {
        new: true
      }).exec((err, doc) => {
        (err) ? res.status(500).json(err) : res.status(200).json({ result: true });
    });
  }
};

userController.find = (req, res, next) => {
  user.aggregate(
    [
      {
        $match: { email: req.body.email }
      }
    ],
    function(err, data) {
      if (err) {
        res.json(err);
      } else {
        if (data.length >= 1) res.json({ result: false });
        else res.json({ result: true });
      }
    }
  );
};

userController.youtubeSettingsOldUsers = (req, res, next) => {
  user.findByIdAndUpdate(
    ObjectId(req.body.id),
    {
      $set: {
        savetoYoutube: req.body.savetoYoutube,
        show_modal_box: req.body.show_modal_box,
        youtube_status: req.body.youtube_status
      }
    },
    {
      new: true
    },
    (err, utubesettingsoldusers) => {
      if(err) {
        res.status(500).send({
          success: false,
          message: "Server side error occcurred"
        })
        return;
      }
      res.send(utubesettingsoldusers);
    }
  );
};

userController.deactivate = (req, res, next) => {
  user.findByIdAndUpdate(
    ObjectId(req.params.id),
    {
      $set: {
        userStatus: "InActive"
      }
    },
    {
      new: true
    },
    (err, deactivate) => {
      if(err) {
        res.status(500).json({
          success: false,
          message: "Server side error occcurred"
        });
        return;
      }
      res.json(deactivate);
    }
  );
};

userController.activate = (req, res, next) => {
  user.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        userStatus: "Active"
      }
    },
    {
      new: true
    },
    (err, deactivate) => {
      if(err) {
        res.status(500).json({
          success: false,
          message: "Server side error occcurred"
        });
        return;
      }
      res.json(deactivate);
    }
  );
};

userController.getusers = (req, res, next) => {
  user
  .find(
    {
      role: "user"
    },
    {
      firstName: 1,
      profilePicture: 1,
      lastName: 1,
      id: 1,
      address: 1,
      email: 1,
      userName: 1,
      privateSite:1,
      privateSiteSettings:1
    }
  )
  .exec(function(err, data) {
    if (!err) {
      res.json(data);
    } else {
      res.status(500).json({
        success: false,
        message: "Server side error occcurred"
      })
    }
  });
};

userController.getUserNames = (req, res, next) => {
  user
  .find(
    {
      role: "user"
    },
    {
      userName: 1,
    }
  )
  .exec(function(err, data) {
    if (!err) {
      let usernames = [];
      data.forEach(element => {
        usernames.push(element.userName)
      });
      res.json(usernames);
    } else {
      res.status(500).json({
        success: false,
        message: "Server side error occcurred"
      })
    }
  });
};

userController.getuserprofile = (req, res, next) => {
  user
    .find(
      {
        userName: req.body.username,
        role: "user"
      },
      {
        firstName: 1,
        profilePicture: 1,
        lastName: 1,
        id: 1,
        address: 1,
        email: 1,
        userName: 1,
        privateSite:1,
        privateSiteSettings:1
      }
    )
    .exec(function(err, data) {
      if (!err) {
        res.json(data);
      } else {
        res.status(500).json({
          success: false,
          message: "Server side error occcurred"
        });
      }
    });
};

userController.searchUsers = (req, res, next) => {
  var name = req.param.id;
  var query = {
    firstName: new RegExp("^" + name)
  };
  user.find(query).exec((err, docs) => {
    res.json(docs);
  });
};

userController.checkPrivateSiteName = (req, res, next) => {
  var name = req.params.name;
  var query={
    "settings.siteName":name
  }
  privateSite.find(query).exec((err, docs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(docs);
    }
  });
};

userController.getPrivateSiteSubscribersCount = (req, res, next) => {
  let id = req.params.id;
  if (!id) {
    res.status(200).json({
      success: false,
      message: "User id is required"
    });
  } else {
    VirtualID.aggregate(
    [
      {
        $match: {
          ownerId: ObjectId(req.params.id)
        }
      },
      {
        $lookup: {
          from : "subscription",
          let: {
            siteId: "$_id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$privateSiteId", "$$siteId"]
                }
              }
            }
          ],
          as: "subscriptionDetails"
        }
      },
      {
        $project:{
          _id: 1,
          subscribersCount: { $size: "$subscriptionDetails" },
        }
      }
    ], (err, response) => {
      if (response) {
        res.status(200).json({
          success: true,
          data: response
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Server side error occurred",
          error: err
        });
      }
    })
  }
}



module.exports = userController;