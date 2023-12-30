const { ObjectId } = require("mongodb");
const privateSite = require("../models/Privatesite");
const virtualID = require("../models/VirtualID");
const uuid = require('uuid');
const user = require('../models/User');

profileController = () => { }

// Adds a user admin to private site
profileController.makeAdmin = (req, res) => {
    privateSite.findByIdAndUpdate(
        ObjectId(req.body.privateSiteDocId),
        {
            $push: {
                admins: req.body.userId
            }
        },
        {
            new: true
        }, (err, data) => {
            if (err) {
                console.log(err);
            } else {    
                res.json(data);
            }
        }
    );
};

// Removes a user admin from private site
profileController.removeAdmin = (req, res) => {
    privateSite.findByIdAndUpdate(
        ObjectId(req.body.privateSiteDocId),
        {
            $pull: {
                admins: req.body.userId
            }
        },
        {
            new: true
        }, (err, data) => {
            if (err) {
                console.log(err);
            } else {    
                res.json(data);
            }
        }
    );
};

profileController.getPrivateProfile = (req, res) => {
    if (req.params.id !== "null") {
        privateSite.findOne(
            {
                "ownerId": ObjectId(req.params.id)
            }, (err, data) => {
                if (err) {
                  res.status(500).json({
                    error: err
                  });
                } else {
                  res.json(data);
                }
            }
        );
    } else {
        res.json({result: false, message: "Required parameter are not provided"});
        return;
    }
};

profileController.getProfile = (req, res) => {
    user
    .find(
      {
        _id: ObjectId(req.params.id)
      },
      {
        savetoYoutube: 1,
        show_modal_box: 1,
        privateSite: 1,
        youtube_status: 1,
        messagePermission: 1,
        privateSiteSettings: 1
      }
    )
    .exec(function (err, data) {
      if (err) {
        res.json(err);
      } else {
        res.json(data);
      }
    });
};

profileController.getPrivateSite = (req, res) => {
    privateSite.find(
        {
         'settings.siteName': req.params.id
        }
      )
      .exec((err, data) => {
        if (err) {
          res.json(err);
        } else {
          res.json(data);
        }
      });
};

profileController.getUserProfileDetails = (req, res) => {
    user.find({ _id: ObjectId(req.params.id) })
    .exec((err, data) => {
      if (!err) {
        res.json(data);
      } else {
        res.json(err);
      }
    });
};

profileController.getVirtualUserProfileDetails = (req, res) => {
    privateSite.findOne(
        {
          virtualUser: req.params.id
        }, (err, data) => {
          if (err) {
            res.json(err);
            console.log(err);
          } else {
            res.json(data);
          }
        }
      )
};

profileController.getPrivateSiteDetails = (req, res) => {
    privateSite.findById(
        {
          _id: ObjectId(req.params.id)
        }, (err, data) => {
          if (err) {
            console.log(err);
            res.status(500).json(err);
          } else {
            res.json(data);
          }
        }
      )
};

profileController.getPrivateSiteSettings = (req, res) => {
    privateSite.findOne(
        {
          virtualUser: ObjectId(req.params.id)
        }, (err, data) => {
          if (err) {
            res.status(500).json(err);
          } else {
            if (data) {
              let keys = Object.keys(data);
              if (!keys.includes('isActive')) {
                  data['isActive'] = true;
              }
          }
            res.json(data);
          }
        }
      )
};

profileController.savePrivateSiteSettings = (req, res) => {
    var privateSiteSettings = new privateSite();
    var virtualUser = new virtualID();
    privateSiteSettings.ownerId = req.body.id;
    privateSiteSettings.settings = req.body.privateSiteSettings;
    privateSiteSettings.messagePermission = req.body.allowAutomaticSubscription
    privateSiteSettings.privateTopicsPublicView = req.body.privateTopicsPublicView
    privateSiteSettings.allowAutomaticSubscription = req.body.allowAutomaticSubscription
    virtualUser.ownerId = req.body.id;
    virtualUser.firstName = req.body.privateSiteSettings.siteName;
    virtualUser.lastName = "(Site Admin)";
    virtualUser.profilePicture = req.body.privateSiteSettings.siteLogo;
    virtualUser.address.country = req.body.address;
    virtualUser.save((err, response) => {
        if (err) {
        console.log("Error encountered");
        } else {
        privateSiteSettings.virtualUser = response._id;
        privateSiteSettings.admins = [req.body.id];
        privateSiteSettings.save((err, data) => {
            if (err) {
            console.log("Error encountered");
            } else {
            console.log(data);
            let privateSiteId = data.id
            virtualID.findOneAndUpdate(
                { _id: ObjectId(data.virtualUser) },
                {
                $set: {
                    privateSiteSettings: data.id
                }
                }, (err, doc) => {
                if (err) {
                  res.send(err);
                  console.log(err)
                } else {
                res.json({data : doc , privateSiteId: privateSiteId});
                }
            });
            }
        })
        }
    });
};

profileController.updatePrivateSiteSettings = (req, res) => {
    privateSite.findByIdAndUpdate({
        _id: ObjectId(req.body.privateSiteSettingsId)
      },
      {
        settings: req.body.privateSiteSettings,
        allowAutomaticSubscription: req.body.allowAutomaticSubscription,
        privateTopicsPublicView: req.body.privateTopicsPublicView
      },
      {
        new: true
      }, (err, data) => {
        if (err) {
          res.send(err);
          console.log(err);
        } else {
          console.log(data);
          res.json(data);
        }
    });
};

profileController.getPollsterData = (req, res) => {
    user.findOne(
        {
          virtualUID: req.params.id
        },
        {
          firstName: 1,
          lastName: 1,
          userName: 1,
          userStatus: 1,
          address: 1,
          profilePicture: 1,
          privateSite:1,
          email: 1
        }, (err, data) => {
          if (err) {
            res.status(500).send(err);
            console.log(err);
          } else {
            console.log(data);
            res.json(data);
          }
        }
      )
};

profileController.updatePrivateSite = (req, res) => {
    user.findOneAndUpdate(
        { _id: ObjectId(req.body.id) },
        {
          $push: {
            virtualUID: req.body._id
          }
        }, (err, data) => {
          if (err) {
            res.json(err);
            console.log(err);
          } else {
            res.json(data);
          }
        });
};

profileController.getPrivateSitesForSearch = (req, res) => {
    privateSite
    .find()
    .exec(function(err, data) {
      if (!err) {
        res.json(data);
      } else {
        res.json(err);
      }
    });
};

profileController.updateProfile = (req, res) => {
    user.findByIdAndUpdate(
        ObjectId(req.body.id),
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            profilePicture: req.body.profilePicture,
            address: req.body.address
          }
        },
        {
          new: true
        },
        (err, updateProfile) => {
          if(err) {
            res.status(err);
            return;
          }
          res.send(updateProfile);
        }
      );
};

profileController.getAllPrivateSites = (req,res) => {
  let id = req.params.id
  privateSite.aggregate([
    {
      $match: {
        ownerId: ObjectId(id)
      }
    }
  ], (err,data)=> {
    if(err) {
      res.json(err);
    } else {
      res.json(data);
    }
  })
}

module.exports = profileController