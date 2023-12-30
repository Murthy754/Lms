const { ObjectId } = require("mongodb");
const retruthtopics = require("../models/Retruthtopics");

retruthController = () => { };

retruthController.getretruthpolls = (req, res, next) => {
    retruthtopics.aggregate(
        [
          {
            $match: {
              user_id: ObjectId(req.body.user_id)
            }
          },
          {
            $lookup: {
              from: "poll",
              let: {
                pollid: "$poll_id"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$pollid"]
                        },
                        {
                          $eq: ["$status", "Open"]
                        }
                      ]
                    }
                  }
                }
              ],
              as: "poll"
            }
          },
          {
            $unwind: "$poll"
          },
          {
            $lookup: {
              from: "retruthtopics",
              let: {
                pollid: "$poll_id"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$poll_id", "$$pollid"]
                        },
                        {
                          $eq: ["$user_id", ObjectId(req.body.user_id)]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    user_id: 1,
                    poll_id: 1,
                    retruth_reason: 1
                  }
                }
              ],
              as: "poll.retruthtopic"
            }
          },
          {
            $lookup: {
              from: "pollresult",
              let: {
                pollid: "$poll._id"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$poll", "$$pollid"]
                        },
                        {
                          $eq: ["$user", ObjectId(req.body.user_id)]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    country: 1,
                    result: 1,
                    user: 1,
                    poll: 1
                  }
                }
              ],
              as: "poll.pollresult"
            }
          },
          {
            $lookup: {
              from: "subscription",
              let: {
                pollid: "$poll.pollster"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$subscribee", "$$pollid"]
                        },
                        {
                          $eq: ["$subscriber", ObjectId(req.body.user_id)]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    status: 1,
                    feedoption: 1,
                    subscriber: 1
                  }
                }
              ],
              as: "poll.subscriptionStatus"
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
                pollid: "$poll.pollster"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$pollid"]
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
                    _id: 1
                  }
                }
              ],
              as: "poll.pollster"
            }
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

module.exports = retruthController;