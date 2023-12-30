const broadcast = require("../models/Broadcast");
const broadcastreplies = require("../models/BroadcastReplies");
const { ObjectId } = require("mongodb");

broadcastController = () => { };

broadcastController.savebroadcast = (req, res, next) => {
    const broadcastObj = new broadcast(req.body);
    broadcastObj.save((err, data) => {
        if(!err){
        res.send(data);
        } else {
          res.send({ result: false, error: err })
        }
    });
}

broadcastController.savebroadcastreply = (req, res, next) => {
    const broadcastt = new broadcastreplies(req.body);
    broadcastt.save((err, data) => {
        if(!err){
        res.send(data);
        } else {
          res.send({ result: false, error: err });
        }
    });
}

broadcastController.getbroadcasts = (req, res, next) => {
    broadcast.aggregate(
        [
          {
            $match: {
              poll: ObjectId(req.body.pollid)
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "user",
              let: {
                userid: "$pollster"
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
              as: "pollster"
            }
          },
          {
            $unwind: "$pollster"
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
}

broadcastController.getprivatebroadcasts = (req, res, next) => {
    broadcast.aggregate(
        [
          {
            $match: {
              poll: ObjectId(req.body.pollid)
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "virtualID",
              let: {
                userid: "$pollster"
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
                    ownerId:1,
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
              as: "pollster"
            }
          },
          {
            $unwind: "$pollster"
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
}

broadcastController.getbroadcastsreplies = (req, res, next) => {
    broadcastreplies.aggregate(
        [
          {
            $match: {
              broadcast: ObjectId(req.body.broadcast)
            }
          },
          {
            $match: {
              user: ObjectId(req.body.pollster)
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "user",
              let: {
                userid: "$user"
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
}

broadcastController.getbroadcastsrepliesall = (req, res, next) => {
    broadcastreplies.aggregate(
        [
          {
            $match: {
              broadcast: ObjectId(req.body.broadcast)
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "user",
              let: {
                userid: "$user"
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
}

broadcastController.incremntreplybroadcastcount = (req, res, next) => {
    broadcast
    .update(
      { _id: ObjectId(req.body.broadcastid) },
      {
        $inc: { replyCount: 1 }
      }
    )
    .exec((err, data) => {
      if(data) {
        res.send(data);
      } else {
      res.send({ result: false, error: err });
      }
    });
}

broadcastController.decremntbroadcastcount = (req, res, next) => {
    broadcast
    .update(
      { _id: ObjectId(req.body.broadcastid) },
      {
        $inc: { pollCommentCount: -1 }
      }
    )
    .exec((err, data) => {
      if(err) {
        res.send({ result: false, error: err });
      } else {
      res.send(data);
      }
    });
}

module.exports = broadcastController;
