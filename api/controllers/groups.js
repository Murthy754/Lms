var groups = require("../models/Groups");
const { ObjectId } = require("mongodb");

groupsController = () => { };

groupsController.getMyPrivateGroups = (req, res, next) => {
    return groups.aggregate([
        {
          $match: {
            $or: 
            [
              {"groupMembers._id":{$in:[req.params.id]}},
              {createdBy:ObjectId(req.params.id)}
            ]
          }
        },
        {
          $match: {
            privateSiteId: ObjectId(req.params.siteId)
          }
        }
      ]).exec((err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.status(200).send(data);
        }
      })
};

// Removes user as admin
groupsController.removeAdmin = (req, res, next) => {
  groups.update(
    { _id: ObjectId(req.params.groupId) },
    {
      $pull: { admins:req.body.data}
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

// Gets groups of user
groupsController.getMyGroups = (req, res, next) => {
  groups
  .find(
    {
      $or: [
        {
          "groupMembers._id":{$in:[req.params.id]}
        },
        // {
        //   createdBy:ObjectId(req.params.id)
        // },
        {
          admins: { $in: [req.params.id]}
        }
    ], 
    $and: [
      {
        privateSiteId: null
      }
    ]})
  .exec(function(err, data) {
    if (!err) {
      res.json(data);
    } else {
      res.json({
        success: false,
        message: "Server side error occcurred"
      })
    }
  });
};

groupsController.createGroup = (req, res, next) => {
  const group = new groups(req.body.groupSettings);
  group.save((err, data) => {
    if(err) {
      res.json({
        success: false,
        message: "Server side error occcurred"
      });
      return;
    }
    res.json(data);
  });
};

groupsController.getGroups = (req, res, next) => {
  groups
  .find()
  .exec(function(err, data) {
    if (!err) {
      res.json(data);
    } else {
      res.json({
        success: false,
        message: "Server side error occcurred"
      })
    }
  });
};

groupsController.makeAdmin = (req, res, next) => {
  groups.update(
    { _id: ObjectId(req.params.groupId) },
    {
      $push: { admins:req.body.data}
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

groupsController.removeUserFromGroup = (req, res, next) => {
  groups.update(
    { _id: ObjectId(req.params.groupId) },
    {
      "$pull": {
        "groupMembers": {
          "_id": req.body.data
        }
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

groupsController.addMembersToGroup = (req, res, next) => {
  groups.update(
    { _id: ObjectId(req.params.groupId) },
    {
      $push: {
        groupMembers:req.body
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

groupsController.updateGroup = (req, res, next) => {
  groups.findByIdAndUpdate(
    ObjectId(req.body.id),
    {
      $set: {
        groupName: req.body.groupName,
        groupIcon: req.body.groupIcon,
      }
    },
    {
      new: true
    },
    (err, updateProfile) => {
      if(err) {
        res.send({
          success: false,
          message: "Server side error occcurred"
        })
        return;
      }
      res.send(updateProfile);
    }
  );
};

module.exports = groupsController;