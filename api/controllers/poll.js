
const { ObjectId } = require("mongodb");
var poll = require("../models/Poll");
const pollresult = require('../models/Pollresult');
var scrape = require('html-metadata');
var Subscription = require("../models/Subscription");
var retruthtopics = require("../models/Retruthtopics");

pollController = () => { };

// Gets private profile feed polls
pollController.getprivateprofilfeedpoll = (req, res, next) => {
    var siteValue = null;
    if (req.body.privateSiteId) {
      siteValue = ObjectId(req.body.privateSiteId);
    }
    var pollsters = [];
    var pollsterArray = req.body.pollsterset;
    var number = req.body.pageno;
    var skip = (number - 1) * 20;
    // var limit;
    // if(req.body.limitt){
    //     limit=req.body.limitt
    // }
    // else {
    //     limit = 20;
    // }

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
          pollsterArray = data;
          pollsterArray.forEach(element => {
            if (element.feedoption === "start") {
              pollsters.push(ObjectId(element.subscribee._id));
            }
          });

          poll.aggregate(
            [
              {
                $match: {
                  status: "Open"
                }
              },
              {
                $match: {
                  pollster: { $in: pollsters }
                }
              },
              {
                $match: {
                  privateSite: true
                }
              },
              {
                $match:{
                  categories: { $in: req.body.categories }
                }
              },
              {
                $match: {
                  country: req.body.country
                }
              },
              { $skip: skip },
              // { $limit: limit },
              { $sort: { createdAt: -1 } },
              {
                $lookup: {
                  from: "user",
                  let: {
                    pollid: "$pollster"
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
                  as: "pollster"
                }
              },
              {
                $unwind: "$pollster"
              },
              {
                $lookup: {
                  from: "subscription",
                  let: {
                    pollid: "$pollster._id"
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            {
                              $eq: ["$subscriber", ObjectId(req.body.id)]
                            },
                            {
                              $eq: ["$subscribee", "$$pollid"]
                            },
                            {
                              $eq: ["$privateSiteId", ObjectId(req.body.privateSiteId)]
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
                  as: "subscriptionStatus"
                }
              },
              {
                $lookup: {
                  from: "pollresult",
                  let: {
                    pollid: "$_id"
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
                              $eq: ["$user", ObjectId(req.body.id)]
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
                  as: "pollresult"
                }
              },
              {
                $lookup: {
                  from: "retruthtopics",
                  let: {
                    pollid: "$_id"
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
                              $eq: ["$user_id", ObjectId(req.body.id)]
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
                  as: "retruthtopic"
                }
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
      }
    )
    
    return;
};

pollController.getprivateprofilefeedpollbycountry = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  var pollsters = [];
  var pollsterArray = req.body.pollsterset;
  var number = req.body.pageno;
  var skip = (number - 1) * 20;
  // var limit;
  // if(req.body.limitt){
  //     limit=req.body.limitt
  // }
  // else {
  //     limit = 20;
  // }

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
          from: "virtualID",
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
        pollsterArray = data;
        pollsterArray.forEach(element => {
          if (element.feedoption === "start") {
            pollsters.push(ObjectId(element.subscribee._id));
          }
        });

        poll.aggregate(
          [
            {
              $match: {
                status: "Open"
              }
            },
            {
              $match: {
                pollster: { $in: pollsters }
              }
            },
            {
              $match: {
                privateSite: true
              }
            },
            {
              $match:{
                categories: { $in: req.body.categories }
              }
            },
            {
              $match: {
                country: req.body.country
              }
            },
            { $skip: skip },
            // { $limit: limit },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "virtualID",
                let: {
                  pollid: "$pollster"
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
                as: "pollster"
              }
            },
            {
              $unwind: "$pollster"
            },
            {
              $lookup: {
                from: "subscription",
                let: {
                  pollid: "$pollster._id"
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$subscriber", ObjectId(req.body.id)]
                          },
                          {
                            $eq: ["$subscribee", "$$pollid"]
                          },
                          {
                            $eq: ["$privateSiteId", ObjectId(req.body.privateSiteId)]
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
                as: "subscriptionStatus"
              }
            },
            {
              $lookup: {
                from: "pollresult",
                let: {
                  pollid: "$_id"
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
                            $eq: ["$user", ObjectId(req.body.id)]
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
                as: "pollresult"
              }
            },
            {
              $lookup: {
                from: "retruthtopics",
                let: {
                  pollid: "$_id"
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
                            $eq: ["$user_id", ObjectId(req.body.id)]
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
                as: "retruthtopic"
              }
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
    }
  )
  
  return;
};
// Gets private profile topics by location
pollController.getprivatesubscriberprofiletopics = (req, res, next) => {
    var siteValue = null;
    if (req.body.privateSiteId) {
        siteValue = ObjectId(req.body.privateSiteId);
    }
    var number = req.body.pageno;
    var skip = (number - 1) * 20;
    // var limit;
    // if(req.body.limitt) {
    //     limit=req.body.limitt;
    // }
    // else {
    //     limit = 20;
    // }
    return poll.aggregate(
        [
        {
            $match: {
                status: "Open"
            }
        },
        {
            $match:{
                categories: { $in: req.body.categories }
            }
        },
        {
            $match: {
              privateSiteId: siteValue
            }
        },
        {
            $match: {
                country: req.body.country
            }
        },
        {
            $match: {
                privateSite: true
            }
        },
        {
            $match: {
                $or:[
                {
                    siteOwnerId:ObjectId(req.body.id)
                },
                {
                    retruth_by_ids: { $in: [req.body.id] }
                },
                {
                    pollster:ObjectId(req.body.id)
                },
                ]
            }
        },
        { $skip: skip },
        // { $limit: limit },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
            from: "user",
            let: {
                pollid: "$pollster"
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
            as: "pollster"
            }
        },
        {
            $unwind: "$pollster"
        },
        {
            $lookup: {
            from: "subscription",
            let: {
                pollid: "$pollster._id"
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $and: [
                        {
                        $eq: ["$subscriber", ObjectId(req.body.id)]
                        },
                        {
                        $eq: ["$subscribee", "$$pollid"]
                        },
                        {
                        $eq: ["$privateSiteId", siteValue]
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
            as: "subscriptionStatus"
            }
        },
        {
            $lookup: {
            from: "pollresult",
            let: {
                pollid: "$_id"
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
                        $eq: ["$user", ObjectId(req.body.id)]
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
            as: "pollresult"
            }
        },
        {
            $lookup: {
            from: "retruthtopics",
            let: {
                pollid: "$_id"
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
                        $eq: ["$user_id", ObjectId(req.body.id)]
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
            as: "retruthtopic"
            }
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

// Gets virtual user profile polls for subscribers by location
pollController.getprivatesubscriberownerprofiletopics = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
      siteValue = ObjectId(req.body.privateSiteId);
  }

  if (req.body.country )
  var number = req.body.pageno;
  var skip = (number - 1) * 20;
  // var limit;
  // if(req.body.limitt) {
  //     limit=req.body.limitt;
  // }
  // else {
  //     limit = 20;
  // }
  return poll.aggregate(
      [
      {
          $match: {
              status: "Open"
          }
      },
      {
          $match:{
              categories: { $in: req.body.categories }
          }
      },
      {
          $match: {
              country: req.body.country
          }
      },
      {
          $match: {
              privateSite: true
          }
      },
      {
          $match: {
              $or:[
              {
                  siteOwnerId:ObjectId(req.body.id)
              },
              {
                  retruth_by_ids: { $in: [req.body.id] }
              },
              {
                  pollster:ObjectId(req.body.id)
              },
              ]
          }
      },
      { $skip: skip },
      // { $limit: limit },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "virtualID",
          let: {
            pollid: "$pollster"
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
                ownerId: 1,
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
          as: "virtualUser"
        }
      },
      {
        $unwind: "$pollster"
      },
      // {
      //     $lookup: {
      //     from: "user",
      //     let: {
      //         userId: "$virtualUser.ownerId"
      //     },
      //     pipeline: [
      //         {
      //         $match: {
      //             $expr: {
      //             $eq: ["$_id", "$$userId"]
      //             }
      //           }
      //         },
      //         {
      //         $project: {
      //             firstName: 1,
      //             lastName: 1,
      //             userName: 1,
      //             userStatus: 1,
      //             address: 1,
      //             profilePicture: 1,
      //             email: 1,
      //             _id: 1
      //         }
      //         }
      //     ],
      //     as: "pollster"
      //     }
      // },
      // {
      //     $unwind: "$pollster"
      // },
      {
          $lookup: {
          from: "subscription",
          let: {
              pollid: "$virtualUser._id"
          },
          pipeline: [
              {
              $match: {
                  $expr: {
                  $and: [
                      {
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                      },
                      {
                      $eq: ["$subscribee", "$$pollid"]
                      },
                      {
                      $eq: ["$privateSiteId", siteValue]
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
          as: "subscriptionStatus"
          }
      },
      {
          $lookup: {
          from: "pollresult",
          let: {
              pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
          }
      },
      {
          $lookup: {
          from: "retruthtopics",
          let: {
              pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
          }
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

pollController.getprivatesubscriberownerprofiletopicsbyworld = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
      siteValue = ObjectId(req.body.privateSiteId);
  }

  if (req.body.country )
  var number = req.body.pageno;
  var skip = (number - 1) * 20;
  // var limit;
  // if(req.body.limitt) {
  //     limit=req.body.limitt;
  // }
  // else {
  //     limit = 20;
  // }
  return poll.aggregate(
      [
      {
          $match: {
              status: "Open"
          }
      },
      {
          $match:{
              categories: { $in: req.body.categories }
          }
      },
      {
          $match: {
              privateSite: true
          }
      },
      {
          $match: {
              $or:[
              {
                  siteOwnerId:ObjectId(req.body.id)
              },
              {
                  retruth_by_ids: { $in: [req.body.id] }
              },
              {
                  pollster:ObjectId(req.body.id)
              },
              ]
          }
      },
      { $skip: skip },
      // { $limit: limit },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "virtualID",
          let: {
            pollid: "$pollster"
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
              userId: "$virtualUser.ownerId"
          },
          pipeline: [
              {
              $match: {
                  $expr: {
                  $eq: ["$_id", "$$userId"]
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
          as: "pollster"
          }
      },
      {
          $unwind: "$pollster"
      },
      {
          $lookup: {
          from: "subscription",
          let: {
              pollid: "$virtualUser._id"
          },
          pipeline: [
              {
              $match: {
                  $expr: {
                  $and: [
                      {
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                      },
                      {
                      $eq: ["$subscribee", "$$pollid"]
                      },
                      {
                      $eq: ["$privateSiteId", siteValue]
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
          as: "subscriptionStatus"
          }
      },
      {
          $lookup: {
          from: "pollresult",
          let: {
              pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
          }
      },
      {
          $lookup: {
          from: "retruthtopics",
          let: {
              pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
          }
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

// Gets private profile topics by world
pollController.getprivatesubscriberprofiletopicsbyworld = (req, res, next) => {
    var siteValue = null;
    if (req.body.privateSiteId !== null) {
        siteValue = ObjectId(req.body.privateSiteId);
    }
    var number = req.body.pageno;
    var skip = (number - 1) * 20;
    // var limit;
    // if(req.body.limitt) {
    //     limit=req.body.limitt;
    // }
    // else {
    //     limit = 20;
    // }
    return poll.aggregate(
        [
        {
            $match: {
                status: "Open"
            }
        },
        {
            $match: {
                categories: { $in: req.body.categories }
            }
        },
        {
            $match: {
                privateSite: true
            }
        },
        {
            $match: {
                privateSiteId: siteValue
            }
        },
        {
            $match:{
                $or:[
                {
                    siteOwnerId:ObjectId(req.body.id)
                },
                {
                    retruth_by_ids: { $in: [req.body.id] }
                },
                {
                    pollster:ObjectId(req.body.id)
                },
                ]
            }
        },
        { $skip: skip },
        // { $limit: limit },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
            from: "user",
            let: {
                pollid: "$pollster"
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
            as: "pollster"
            }
        },
        {
            $unwind: "$pollster"
        },
        {
            $lookup: {
            from: "subscription",
            let: {
                pollid: "$pollster._id"
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $and: [
                        {
                        $eq: ["$subscriber", ObjectId(req.body.id)]
                        },
                        {
                        $eq: ["$subscribee", "$$pollid"]
                        },
                        {
                        $eq: ["$privateSiteId", siteValue]
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
            as: "subscriptionStatus"
            }
        },
        {
            $lookup: {
            from: "pollresult",
            let: {
                pollid: "$_id"
            },
            pipeline: 
            [
                {
                $match: {
                    $expr: {
                    $and: [
                        {
                        $eq: ["$poll", "$$pollid"]
                        },
                        {
                        $eq: ["$user", ObjectId(req.body.id)]
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
            as: "pollresult"
            }
        },
        {
            $lookup: {
            from: "retruthtopics",
            let: {
                pollid: "$_id"
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
                        $eq: ["$user_id", ObjectId(req.body.id)]
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
            as: "retruthtopic"
            }
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

// Gets private owner topics for private site
pollController.getprivateprofiletopics = (req, res, next) => {
    var number = req.body.pageno;
    var skip = (number - 1) * 20;
    // var limit;
    // if(req.body.limitt) {
    //     limit=req.body.limitt;
    // }
    // else {
    //     limit = 20;
    // }
    return poll.aggregate(
      [
        {
          $match: {
            status: "Open"
          }
        },
        {
          $match: {
            categories: { $in: req.body.categories }
          }
        },
        {
          $match: {
            country: req.body.country
          }
        },
        {
          $match: {
              $or:[
                {
                    siteOwnerId:ObjectId(req.body.id)
                },
                {
                    retruth_by_ids: { $in: [req.body.id] }
                },
                {
                    pollster:ObjectId(req.body.id)
                }
              ]
          }
        },
        { $skip: skip },
        // { $limit: limit },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "virtualID",
            let: {
              pollid: "$pollster"
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
                  ownerId: 1,
                  firstName: 1,
                  lastName: 1,
                  userName: 1,
                  userStatus: 1,
                  address: 1,
                  profilePicture: 1,
                  privateSite:1,
                  email: 1,
                  _id: 1
                }
              }
            ],
            as: "pollster"
          }
        },
        {
          $unwind: "$pollster"
        },
        {
          $lookup: {
            from: "subscription",
            let: {
              pollid: "$pollster._id"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$subscriber", ObjectId(req.body.id)]
                      },
                      {
                        $eq: ["$subscribee", "$$pollid"]
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
            as: "subscriptionStatus"
          }
        },
        {
          $lookup: {
            from: "pollresult",
            let: {
              pollid: "$_id"
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
                        $eq: ["$user", ObjectId(req.body.id)]
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
            as: "pollresult"
          }
        },
        {
          $lookup: {
            from: "retruthtopics",
            let: {
              pollid: "$_id"
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
                        $eq: ["$user_id", ObjectId(req.body.id)]
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
            as: "retruthtopic"
          }
        },
        {
          $lookup: {
            from: "user",
            let: {
              userId: "$pollster.ownerId"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userId"]
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
                  privateSite:1,
                  email: 1
                }
              }
            ],
            as: "userDetails"
          }
        },
      ], (err, data) => {
        if (err) {
          res.status(404).json(err);
        } else {
          res.status(200).json(data);
        }
      }
    );
};

// Get private site owner topics by world
pollController.getprofiletopicsbyworld = (req, res, next) => {
    var siteValue = null;
    if (req.body.privateSiteId !== null) {
        siteValue = ObjectId(req.body.privateSiteId);
    }
    var number = req.body.pageno;
    var skip = (number - 1) * 20;
    // var limit;
    // if(req.body.limitt) {
    //     limit=req.body.limitt
    // }
    // else {
    //     limit = 20;
    // }
    return poll.aggregate(
        [
        {
            $match: {
            status: "Open"
            }
        },
        {
            $match: {
            categories: { $in: req.body.categories }
            }
        },
        {
            $match: {
            privateSiteId: siteValue
            }
        },
        // {
        //     $match: {
        //     privateSite: false
        //     }
        // },
        {
            $match: {
                $or:[
                {
                    siteOwnerId:ObjectId(req.body.id)
                },
                {
                    retruth_by_ids: { $in: [req.body.id] }
                },
                {
                    pollster:ObjectId(req.body.id)
                }
                ]
            }
        },
        { $skip: skip },
        // { $limit: limit },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
            from: "user",
            let: {
                pollid: "$pollster"
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
            as: "pollster"
            }
        },
        {
            $unwind: "$pollster"
        },
        {
            $lookup: {
            from: "subscription",
            let: {
                pollid: "$pollster._id"
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $and: [
                        {
                        $eq: ["$subscriber", ObjectId(req.body.id)]
                        },
                        {
                        $eq: ["$subscribee", "$$pollid"]
                        },
                        {
                        $eq: ["$privateSiteId", siteValue]
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
            as: "subscriptionStatus"
            }
        },
        {
            $lookup: {
            from: "pollresult",
            let: {
                pollid: "$_id"
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
                        $eq: ["$user", ObjectId(req.body.id)]
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
            as: "pollresult"
            }
        },
        {
            $lookup: {
            from: "retruthtopics",
            let: {
                pollid: "$_id"
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
                        $eq: ["$user_id", ObjectId(req.body.id)]
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
            as: "retruthtopic"
            }
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

// Gets owner profile topics by world
pollController.getownerprofiletopicsbyworld = (req, res, next) => {
    var siteValue = null;
    if (req.body.privateSiteId) {
        siteValue = ObjectId(req.body.privateSiteId);
    }
    var number = req.body.pageno;
    var skip = (number - 1) * 20;
    // var limit;
    // var number = req.body.pageno;
    // var skip = (number - 1) * 20;
    // if(req.body.limitt) {
    //     limit=req.body.limitt
    // }
    // else {
    //     limit = 20;
    // }
    return poll.aggregate(
        [
        {
            $match: {
            status: "Open"
            }
        },
        {
            $match: {
            categories: { $in: req.body.categories }
            }
        },
        {
            $match: {
            privateSite: true
            }
        },
        {
            $match: {
            privateSiteId: siteValue
            }
        },
        {
            $match: {
                $or:[
                {
                    retruth_by_ids: { $in: [req.body.id] }
                },
                {
                    pollster:ObjectId(req.body.id)
                }
                ]
            }
        },
        { $skip: skip },
        // { $limit: limit },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
            from: "virtualID",
            let: {
                pollid: "$pollster"
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
                  privateSite:1,
                  email: 1,
                  id: 1
                }
                }
            ],
            as: "pollster"
            }
        },
        {
            $unwind: "$pollster"
        },
        {
            $lookup: {
            from: "subscription",
            let: {
                pollid: "$pollster._id"
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $and: [
                        {
                        $eq: ["$subscriber", ObjectId(req.body.id)]
                        },
                        {
                        $eq: ["$subscribee", "$$pollid"]
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
            as: "subscriptionStatus"
            }
        },
        {
            $lookup: {
            from: "pollresult",
            let: {
                pollid: "$_id"
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
                        $eq: ["$user", ObjectId(req.body.id)]
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
            as: "pollresult"
            }
        },
        {
            $lookup: {
            from: "retruthtopics",
            let: {
                pollid: "$_id"
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
                        $eq: ["$user_id", ObjectId(req.body.id)]
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
            as: "retruthtopic"
            }
        },
        {
            $lookup: {
            from: "user",
            let: {
                userId: "$pollster.ownerId"
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $eq: ["$_id", "$$userId"]
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
                    privateSite:1,
                    email: 1,
                }
                }
            ],
            as: "userDetails"
            }
        },
        ], (err, data) => {
            if (err) {
                res.status(404).json(err);
            } else {
                res.status(200).json(data);
            }
        }
    );
};

pollController.getmetadata = (req, res, next) => {
  scrape(req.query.url).then(metadata => {
    res.status(200).json({result: true, data: metadata.openGraph});
  }).catch(error => {
    res.send({result: false, data: error});
  });
};

// Gets recent polls by world
pollController.getrecentpollsbyworld = (req, res) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  var skip = req.body.range;
  var userIdArray=[];
  if(req.body.id){
    userIdArray.push(req.body.id);
  }
  var limit = 10;
  if(req.body.limit) {
    limit = req.body.limit
  }
  let toDate = new Date();
  let fromDate = new Date(new Date().setDate(new Date().getDate() - 1))
  if(req.body.toDate) {
    toDate = new Date(req.body.toDate);
    toDate.setDate(toDate.getDate()+1)
  }
  if(req.body.fromDate) {
    fromDate = new Date(req.body.fromDate);
  }
  poll.aggregate(
    [
      
      {
        $match: {
          $and: [ 
            { status: "Open" },
            {
              createdAt: {
              $gte: fromDate,
              $lt: toDate
              } 
            },
            { categories: { $in: req.body.categories } },
            { privateSiteId: siteValue },
            {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            }
          ]
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            polsterId: "$pollster"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$polsterId"]
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
                email: 1,
                profilePicture: 1,
                _id: 1
              }
            }
          ],
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                    },
                    {
                      $eq: ["$privateSiteId", siteValue]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
        }
      },
      {
        $group: {
          _id: "$_id",
          question:{$first:'$question'},
          categories:{$first:"$categories"},
          tags:{$first:"$tags"},
          pollOptions:{$first:"$pollOptions"},
          pollOptionsType:{$first:"$pollOptionsType"},
          articleInfo:{$first:"$articleInfo"},
          status:{$first:"$status"},
          flagPollByUserIds:{$first:"$flagPollByUserIds"},
          retruth_by_ids:{$first:"$retruth_by_ids"},
          pollSubscription:{$first:"$pollSubscription"},
          pollRetruthCount:{$first:"$pollRetruthCount"},
          targetCountryCount:{$first:"$targetCountryCount"},
          pollCastCountByAnswer:{$first:"$pollCastCountByAnswer"},
          targetCountryCountByAnswer:{$first:"$targetCountryCountByAnswer"},
          pollTags:{$first:"$pollTags"},
          country:{$first:"$country"},
          privateSite:{$first:"$privateSite"},
          privateSiteSubsOnly:{$first:"$privateSiteSubsOnly"},
          pollCastCount:{$first:"$pollCastCount"},
          pollstatus:{$first:"$pollstatus"},
          expires:{$first:"$expires"},
          privacyOptions:{$first:"$privacyOptions"},
          createdAt:{$first:"$createdAt"},
          retruth_reason:{$first:"$retruth_reason"},
          retruth_by:{$first:"$retruth_by"},
          disableComments:{$first:"$disableComments"},
          siteOwnerId:{$first:"$siteOwnerId"},
          createdFor:{$first:"$createdFor"},
          verifiedVote: { $first: "$verifiedVote" },
          subscribers:{$first:"$subscribers"},
          pollCommentCount:{$first:"$pollCommentCount"},
          subscriptionStatus:{$first:"$subscriptionStatus"},
          isOwn:{
            $sum: {
              $cond: [
                { $eq: ["$pollster._id", ObjectId(req.body.id)] },
                1,
                0
              ]
            }
          },
          Subscribers: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Subscribers"] },
                1,
                0
              ]
            }
          },
          Public: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Public"] },
                1,
                0
              ]
            }
          },
          Specific_Subscribers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$privacyOptions.poll.preference",
                    "Specific_Subscribers"
                  ]
                },
                1,
                0
              ]
            }
          },
          Private: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Private"] },
                1,
                0
              ]
            }
          },
          pollster:{$first:"$pollster"},
          retruthtopic:{$first:"$retruthtopic"},
          pollresult:{$first:"$pollresult"},
          SubscribersList:{$push:"$subscriptionStatus"},
          Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
        }
      },
      {
        $match: {
          $or: [
             {
              $and: [
                {
                  isOwn: {
                    $gte: 1
                  }
                },
                { privateSite: { $eq: false } }
              ]
            },
            {
              $and:[
                  {Public: {
                    $gte: 1
                  }},
                  {privateSite:{$eq:false}}                  
                ]
            },
            {
              $and: [
                {"Subscribers": { $gte:1 } },
                {privateSite:{$eq:false}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { Specific_Subscribers: { $gte: 1 } },
                {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                {privateSite:{$eq:false}}
              ]
            }
          ]
        }
      },
      { $sort: { 
        createdAt: -1,
        _id: 1 
      } },
      { $skip : skip },
      { $limit: limit },
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

// Gets top polls by world
pollController.gettoppollsbyworld = (req, res) => {
  let skip = req.body.range;
  let userIdArray=[];
  if (req.body.id) {
    userIdArray.push(req.body.id);
  }
  let limit = 10;
  if (req.body.limit) {
    limit = req.body.limit;
  }

  let toDate = new Date();
  let fromDate = new Date(new Date().setDate(new Date().getDate() - 1))
  if(req.body.toDate) {
    toDate = new Date(req.body.toDate);
    toDate.setDate(toDate.getDate()+1)
  }
  if(req.body.fromDate) {
    fromDate = new Date(req.body.fromDate);
  }
  poll.aggregate(
    [
      {
        $match: {
          $and: [
            { status: "Open" },
            { categories: { $in: req.body.categories } },
            { privateSiteId: null },
            {
              $or: [
                { pollCastCount: { $gte: 1 } },
                { pollCommentCount: { $gte: 1 } },
                { pollRetruthCount: { $gte: 1 } }
              ]
            }
          ]
        }
      },
      { 
        $sort: {
          pollCastCount: 1 
        } 
      },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                    },
                    {
                      $eq: ["$privateSiteId", null]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
        }
      },
      {
        $group: {
          _id: "$_id",
          question:{$first:'$question'},
          categories:{$first:"$categories"},
          tags:{$first:"$tags"},
          pollOptions:{$first:"$pollOptions"},
          pollOptionsType:{$first:"$pollOptionsType"},
          articleInfo:{$first:"$articleInfo"},
          status:{$first:"$status"},
          flagPollByUserIds:{$first:"$flagPollByUserIds"},
          retruth_by_ids:{$first:"$retruth_by_ids"},
          pollSubscription:{$first:"$pollSubscription"},
          pollRetruthCount:{$first:"$pollRetruthCount"},
          targetCountryCount:{$first:"$targetCountryCount"},
          pollCastCountByAnswer:{$first:"$pollCastCountByAnswer"},
          targetCountryCountByAnswer:{$first:"$targetCountryCountByAnswer"},
          pollTags:{$first:"$pollTags"},
          country:{$first:"$country"},
          siteOwnerId:{$first:"$siteOwnerId"},
          pollCastCount:{$first:"$pollCastCount"},
          pollstatus:{$first:"$pollstatus"},
          expires:{$first:"$expires"},
          createdFor:{$first:"$createdFor"},
          privacyOptions:{$first:"$privacyOptions"},
          createdAt:{$first:"$createdAt"},
          retruth_reason:{$first:"$retruth_reason"},
          retruth_by:{$first:"$retruth_by"},
          disableComments:{$first:"$disableComments"},
          privateSite:{$first:"$privateSite"},
          privateSiteSubsOnly:{$first:"$privateSiteSubsOnly"},
          subscribers:{$first:"$subscribers"},
          pollCommentCount:{$first:"$pollCommentCount"},
          subscriptionStatus:{$first:"$subscriptionStatus"},
          verifiedVote: { $first: "$verifiedVote" },
          isOwn:{
            $sum: {
              $cond: [
                { $eq: ["$pollster._id", ObjectId(req.body.id)] },
                1,
                0
              ]
            }
          },
          Subscribers: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Subscribers"] },
                1,
                0
              ]
            }
          },
          Public: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Public"] },
                1,
                0
              ]
            }
          },
          Specific_Subscribers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$privacyOptions.poll.preference",
                    "Specific_Subscribers"
                  ]
                },
                1,
                0
              ]
            }
          },
          Private: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Private"] },
                1,
                0
              ]
            }
          },
          pollster:{$first:"$pollster"},
          retruthtopic:{$first:"$retruthtopic"},
          pollresult:{$first:"$pollresult"},
          SubscribersList:{$push:"$subscriptionStatus"},
          Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
        }
      },
      {
        $addFields:{
          totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
        }
      },
      {
        $match: {
          $or: [
             {
              $and: [
                {
                  isOwn: {
                    $gte: 1
                  }
                },
                { privateSite: { $eq: false } }
              ]
            },
            {
              $and:[
                  {Public: {
                    $gte: 1
                  }},
                  {privateSite:{$eq:false}}                  
                ]
            },
            {
              $and: [
                {"Subscribers": { $gte:1 } },
                {privateSite:{$eq:false}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { Specific_Subscribers: { $gte: 1 } },
                {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                {privateSite:{$eq:false}}
              ]
            }
          ]
        }
      },
      { $sort: {
          totalCount: -1,
          _id : 1
        } 
      },
      { $skip: skip },
      { $limit: limit }
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

// Gets trending polls by world
pollController.gettrendingpollsbyworld = (req, res) => {
  let skip = req.body.range;
  let limit = 10;
  if (req.body.limit) {
    limit = req.body.limit;
  }
  var toDate = new Date();
  var userIdArray=[];
  if(req.body.id){
    userIdArray.push(req.body.id);
  }
  var toDate = new Date()
  var fromDate = new Date(toDate);
  fromDate.setDate(toDate.getUTCDate() - 1);

  if(req.body.toDate) {
    toDate = new Date(req.body.toDate);
    toDate.setDate(toDate.getDate()+1)
  }
  if(req.body.fromDate) {
    fromDate = new Date(req.body.fromDate);
  }
  
  poll.aggregate(
    [
      {
        $match: {
          $and: [
            { status: "Open" },
            {
              createdAt: {
                $gte: fromDate,
                $lt: toDate
              }
            },
            { categories: { $in: req.body.categories } },
            { privateSiteId: null },
            {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            },

          ]
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                    },
                    {
                      $eq: ["$privateSiteId", null]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
        }
      },
      {
        $group: {
          _id: "$_id",
          question:{$first:'$question'},
          categories:{$first:"$categories"},
          tags:{$first:"$tags"},
          pollOptions:{$first:"$pollOptions"},
          pollOptionsType:{$first:"$pollOptionsType"},
          articleInfo:{$first:"$articleInfo"},
          status:{$first:"$status"},
          flagPollByUserIds:{$first:"$flagPollByUserIds"},
          retruth_by_ids:{$first:"$retruth_by_ids"},
          pollSubscription:{$first:"$pollSubscription"},
          pollRetruthCount:{$first:"$pollRetruthCount"},
          targetCountryCount:{$first:"$targetCountryCount"},
          pollCastCountByAnswer:{$first:"$pollCastCountByAnswer"},
          targetCountryCountByAnswer:{$first:"$targetCountryCountByAnswer"},
          pollTags:{$first:"$pollTags"},
          country:{$first:"$country"},
          pollCastCount:{$first:"$pollCastCount"},
          pollstatus:{$first:"$pollstatus"},
          expires:{$first:"$expires"},
          createdFor:{$first:"$createdFor"},
          privacyOptions:{$first:"$privacyOptions"},
          createdAt:{$first:"$createdAt"},
          retruth_reason:{$first:"$retruth_reason"},
          retruth_by:{$first:"$retruth_by"},
          siteOwnerId:{$first:"$siteOwnerId"},
          privateSite:{$first:"$privateSite"},
          privateSiteSubsOnly:{$first:"$privateSiteSubsOnly"},
          disableComments:{$first:"$disableComments"},
          subscribers:{$first:"$subscribers"},
          pollCommentCount:{$first:"$pollCommentCount"},
          subscriptionStatus:{$first:"$subscriptionStatus"},
          verifiedVote: { $first: "$verifiedVote" },
          isOwn:{
            $sum: {
              $cond: [
                { $eq: ["$pollster._id", ObjectId(req.body.id)] },
                1,
                0
              ]
            }
          },
          Subscribers: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Subscribers"] },
                1,
                0
              ]
            }
          },
          Public: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Public"] },
                1,
                0
              ]
            }
          },
          Specific_Subscribers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$privacyOptions.poll.preference",
                    "Specific_Subscribers"
                  ]
                },
                1,
                0
              ]
            }
          },
          Private: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Private"] },
                1,
                0
              ]
            }
          },
          pollster:{$first:"$pollster"},
          retruthtopic:{$first:"$retruthtopic"},
          pollresult:{$first:"$pollresult"},
          SubscribersList:{$push:"$subscriptionStatus"},
          Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
        }
      },
      {
        $addFields:{
          totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
        }
      },
      {
        $match: {
          $or: [
            {
              $and: [
                {
                  isOwn: {
                    $gte: 1
                  }
                },
                { privateSite: { $eq: false } }
              ]
            },
            {
              $and:[
                  {Public: {
                    $gte: 1
                  }},
                  {privateSite:{$eq:false}}                  
                ]
            },
            {
              $and: [
                {"Subscribers": { $gte:1 } },
                {privateSite:{$eq:false}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { Specific_Subscribers: { $gte: 1 } },
                {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                {privateSite:{$eq:false}}
              ]
            }
          ]
        }
      },
      { $sort: { totalCount: -1, _id: 1 } },


      {$skip: skip },
      {
        $limit: limit
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

pollController.getrecentpollsbycountry = (req, res) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  var skip = req.body.range;
  var userIdArray=[];
  if(req.body.id){
    userIdArray.push(req.body.id);
  }
  var limit = 10;
  if(req.body.limit) {
    limit = req.body.limit
  }

  var toDate = new Date();
  var fromDate = new Date(toDate);
  fromDate.setDate(toDate.getUTCDate() - 1);

  if(req.body.toDate) {
    toDate = new Date(req.body.toDate);
    toDate.setDate(toDate.getDate()+1)
  }
  if(req.body.fromDate) {
    fromDate = new Date(req.body.fromDate);
  }
  poll.aggregate(
    [
      {
        $match: {
          $and: [
            { status: "Open" },
            {
              createdAt: {
              $gte: fromDate,
              $lt: toDate
              } 
            },
            { categories: { $in: req.body.categories } },
            { privateSiteId: siteValue },
            { country: req.body.country },
            {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            }
          ]
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                    },
                    {
                      $eq: ["$privateSiteId", siteValue]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
        }
      },
      {
        $group: {
          _id: "$_id",
          question: { $first: "$question" },
          categories: { $first: "$categories" },
          tags: { $first: "$tags" },
          pollOptions: { $first: "$pollOptions" },
          pollOptionsType: { $first: "$pollOptionsType" },
          articleInfo: { $first: "$articleInfo" },
          status: { $first: "$status" },
          siteOwnerId: { $first: "$siteOwnerId" },
          flagPollByUserIds: { $first: "$flagPollByUserIds" },
          retruth_by_ids: { $first: "$retruth_by_ids" },
          pollSubscription: { $first: "$pollSubscription" },
          pollRetruthCount: { $first: "$pollRetruthCount" },
          targetCountryCount: { $first: "$targetCountryCount" },
          pollCastCountByAnswer: { $first: "$pollCastCountByAnswer" },
          targetCountryCountByAnswer: { $first: "$targetCountryCountByAnswer" },
          pollTags: { $first: "$pollTags" },
          country: { $first: "$country" },
          pollCastCount: { $first: "$pollCastCount" },
          pollstatus: { $first: "$pollstatus" },
          createdFor: { $first: "$createdFor" },
          expires: { $first: "$expires" },
          privacyOptions: { $first: "$privacyOptions" },
          createdAt: { $first: "$createdAt" },
          retruth_reason: { $first: "$retruth_reason" },
          retruth_by: { $first: "$retruth_by" },
          disableComments: { $first: "$disableComments" },
          privateSite: { $first: "$privateSite" },
          privateSiteSubsOnly: { $first: "$privateSiteSubsOnly" },
          subscribers: { $first: "$subscribers" },
          pollCommentCount: { $first: "$pollCommentCount" },
          subscriptionStatus: { $first: "$subscriptionStatus" },
          verifiedVote: { $first: "$verifiedVote" },
          isOwn: {
            $sum: {
              $cond: [{ $eq: ["$pollster._id", ObjectId(req.body.id)] }, 1, 0]
            }
          },
          Subscribers: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Subscribers"] },
                1,
                0
              ]
            }
          },
          Public: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Public"] },
                1,
                0
              ]
            }
          },
          Specific_Subscribers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$privacyOptions.poll.preference",
                    "Specific_Subscribers"
                  ]
                },
                1,
                0
              ]
            }
          },
          Private: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Private"] },
                1,
                0
              ]
            }
          },
          pollster: { $first: "$pollster" },
          retruthtopic: { $first: "$retruthtopic" },
          pollresult: { $first: "$pollresult" },
          SubscribersList: { $push: "$subscriptionStatus" },
          Specific_SubscribersList: { $push: "$privacyOptions.poll" }
        }
      },
      {
        $match: {
          $or: [
            {
              $and: [
                {
                  isOwn: {
                    $gte: 1
                  }
                },
                { privateSite: { $eq: false } }
              ]
            },
            {
              $and: [
                {
                  Public: {
                    $gte: 1
                  }
                },
                { privateSite: { $eq: false } }
              ]
            },
            {
              $and: [
                { Subscribers: { $gte: 1 } },
                { privateSite: { $eq: false } },
                { "SubscribersList.0.status": { $eq: "ACCEPTED" } }
              ]
            },
            {
              $and: [
                { Specific_Subscribers: { $gte: 1 } },
                {
                  "Specific_SubscribersList.subscribers": { $in: userIdArray }
                },
                { privateSite: { $eq: false } }
              ]
            }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
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

pollController.gettoppolls = (req, res, next) => {
  let siteValue = null;
  if (req.body.privateSiteId){
    siteValue = ObjectId(req.body.privateSiteId);
  }
  let skip = req.body.range;
  var userIdArray=[];
  if(req.body.id){
    userIdArray.push(req.body.id);
  }
  let limit = 10;
  if(req.body.limit) {
    limit=req.body.limit
  }
  var toDate = new Date()
  var fromDate = new Date(toDate);
  fromDate.setDate(toDate.getUTCDate() - 1);

  if(req.body.toDate) {
    toDate = new Date(req.body.toDate);
    toDate.setDate(toDate.getDate()+1)
  }
  if(req.body.fromDate) {
    fromDate = new Date(req.body.fromDate);
  }
  poll.aggregate(
    [
      {
        $match: {
          $and: [
            { status: "Open" },
            { privateSiteId: siteValue },
            {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            },
            { categories: { $in: req.body.categories } },
            {
              $or: [
                { pollCastCount: { $gte: 1 } },
                { pollCommentCount: { $gte: 1 } },
                { pollRetruthCount: { $gte: 1 } }
              ]
            },
            { country: req.body.country }
          ]
        }
      },
      { 
        $sort: {
          pollCastCount: 1 
        } 
      },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                    },
                    {
                      $eq: ["$privateSiteId", siteValue]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
        }
      },
      {
        $group: {
          _id: "$_id",
          question:{$first:'$question'},
          categories:{$first:"$categories"},
          tags:{$first:"$tags"},
          pollOptions:{$first:"$pollOptions"},
          pollOptionsType:{$first:"$pollOptionsType"},
          articleInfo:{$first:"$articleInfo"},
          status:{$first:"$status"},
          flagPollByUserIds:{$first:"$flagPollByUserIds"},
          createdFor:{$first:"$createdFor"},
          retruth_by_ids:{$first:"$retruth_by_ids"},
          pollSubscription:{$first:"$pollSubscription"},
          pollRetruthCount:{$first:"$pollRetruthCount"},
          targetCountryCount:{$first:"$targetCountryCount"},
          pollCastCountByAnswer:{$first:"$pollCastCountByAnswer"},
          targetCountryCountByAnswer:{$first:"$targetCountryCountByAnswer"},
          pollTags:{$first:"$pollTags"},
          country:{$first:"$country"},
          pollCastCount:{$first:"$pollCastCount"},
          pollstatus:{$first:"$pollstatus"},
          expires:{$first:"$expires"},
          privacyOptions:{$first:"$privacyOptions"},
          createdAt:{$first:"$createdAt"},
          retruth_reason:{$first:"$retruth_reason"},
          retruth_by:{$first:"$retruth_by"},
          siteOwnerId:{$first:"$siteOwnerId"},
          disableComments:{$first:"$disableComments"},
          privateSite:{$first:"$privateSite"},
          privateSiteSubsOnly:{$first:"$privateSiteSubsOnly"},
          subscribers:{$first:"$subscribers"},
          pollCommentCount:{$first:"$pollCommentCount"},
          subscriptionStatus:{$first:"$subscriptionStatus"},
          verifiedVote: { $first: "$verifiedVote" },
          isOwn:{
            $sum: {
              $cond: [
                { $eq: ["$pollster._id", ObjectId(req.body.id)] },
                1,
                0
              ]
            }
          },
          Subscribers: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Subscribers"] },
                1,
                0
              ]
            }
          },
          Public: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Public"] },
                1,
                0
              ]
            }
          },
          Specific_Subscribers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$privacyOptions.poll.preference",
                    "Specific_Subscribers"
                  ]
                },
                1,
                0
              ]
            }
          },
          Private: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Private"] },
                1,
                0
              ]
            }
          },
          pollster:{$first:"$pollster"},
          retruthtopic:{$first:"$retruthtopic"},
          pollresult:{$first:"$pollresult"},
          SubscribersList:{$push:"$subscriptionStatus"},
          Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
        }
      },
      {
        $addFields:{
          totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
        }
      },
      {
        $match: {
          $or: [
             {
              and: [
                {
                  isOwn: {
                    $gte: 1
                  }
                },
                { privateSite: { $eq: false } }
              ]
            },
            {
              $and:[
                  {Public: {
                    $gte: 1
                  }},
                  {privateSite:{$eq:false}}                  
                ]
            },
            {
              $and: [
                {"Subscribers": { $gte:1 } },
                {privateSite:{$eq:false}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { Specific_Subscribers: { $gte: 1 } },
                {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                {privateSite:{$eq:false}}
              ]
            }
          ]
        }
      },
      { $sort: {
          totalCount: -1 ,
          _id : 1
        } 
      },
      { $skip : skip },
      { $limit: limit }
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

pollController.gettrendingpolls = (req, res, next) => {
  let siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  let skip = req.body.range;
  let limit = 10;
  if(req.body.limit) {
    limit=req.body.limit;
  }
  let userIdArray=[];
  if(req.body.id){
    userIdArray.push(req.body.id);
  }

  var toDate = new Date()
  var fromDate = new Date(toDate);
  fromDate.setDate(toDate.getUTCDate() - 1);

  if(req.body.toDate) {
    toDate = new Date(req.body.toDate);
    toDate.setDate(toDate.getDate()+1)
  }
  if(req.body.fromDate) {
    fromDate = new Date(req.body.fromDate);
  }
  poll.aggregate(
    [
      {
        $match: {
          $and: [
            { status: "Open" },
            {
              createdAt: {
              $gte: fromDate,
              $lt: toDate
              } 
            },
            { privateSiteId: siteValue },
            {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            },
            { categories: { $in: req.body.categories } },
            { country: req.body.country }
          ]
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                    },
                    {
                      $eq: ["$privateSiteId", siteValue]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
        }
      },
      {
        $group: {
          _id: "$_id",
          question:{$first:'$question'},
          categories:{$first:"$categories"},
          tags:{$first:"$tags"},
          pollOptions:{$first:"$pollOptions"},
          pollOptionsType:{$first:"$pollOptionsType"},
          articleInfo:{$first:"$articleInfo"},
          status:{$first:"$status"},
          flagPollByUserIds:{$first:"$flagPollByUserIds"},
          retruth_by_ids:{$first:"$retruth_by_ids"},
          pollSubscription:{$first:"$pollSubscription"},
          pollRetruthCount:{$first:"$pollRetruthCount"},
          targetCountryCount:{$first:"$targetCountryCount"},
          pollCastCountByAnswer:{$first:"$pollCastCountByAnswer"},
          targetCountryCountByAnswer:{$first:"$targetCountryCountByAnswer"},
          pollTags:{$first:"$pollTags"},
          privateSite:{$first:"$privateSite"},
          privateSiteSubsOnly:{$first:"$privateSiteSubsOnly"},
          country:{$first:"$country"},
          pollCastCount:{$first:"$pollCastCount"},
          createdFor:{$first:"$createdFor"},
          siteOwnerId:{$first:"$siteOwnerId"},
          pollstatus:{$first:"$pollstatus"},
          expires:{$first:"$expires"},
          privacyOptions:{$first:"$privacyOptions"},
          createdAt:{$first:"$createdAt"},
          retruth_reason:{$first:"$retruth_reason"},
          retruth_by:{$first:"$retruth_by"},
          disableComments:{$first:"$disableComments"},
          subscribers:{$first:"$subscribers"},
          pollCommentCount:{$first:"$pollCommentCount"},
          subscriptionStatus:{$first:"$subscriptionStatus"},
          verifiedVote: { $first: "$verifiedVote" },
          isOwn:{
            $sum: {
              $cond: [
                { $eq: ["$pollster._id", ObjectId(req.body.id)] },
                1,
                0
              ]
            }
          },
          Subscribers: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Subscribers"] },
                1,
                0
              ]
            }
          },
          Public: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Public"] },
                1,
                0
              ]
            }
          },
          Specific_Subscribers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$privacyOptions.poll.preference",
                    "Specific_Subscribers"
                  ]
                },
                1,
                0
              ]
            }
          },
          Private: {
            $sum: {
              $cond: [
                { $eq: ["$privacyOptions.poll.preference", "Private"] },
                1,
                0
              ]
            }
          },
          pollster:{$first:"$pollster"},
          retruthtopic:{$first:"$retruthtopic"},
          pollresult:{$first:"$pollresult"},
          SubscribersList:{$push:"$subscriptionStatus"},
          Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
        }
      },
      {
        $addFields:{
          totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
        }
      },
      {
        $match: {
          $or: [
             {
              $and: [
                {
                  isOwn: {
                    $gte: 1
                  }
                },
                { privateSite: { $eq: false } }
              ]
            },
            {
              $and:[
                  {Public: {
                    $gte: 1
                  }},
                  {privateSite:{$eq:false}}                  
                ]
            },
            {
              $and: [
                {"Subscribers": { $gte:1 } },
                {privateSite:{$eq:false}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { Specific_Subscribers: { $gte: 1 } },
                {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                {privateSite:{$eq:false}}
              ]
            }
          ]
        }
      },
      { $sort: {
          totalCount: -1 ,
          _id: 1
        } 
      },
      { $skip: skip },
      {
        $limit: limit
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

// Inserts verified voter into polls verifiedvoters array
pollController.insertVerifiedVoter = (req, res, next) => {
  poll.find(
    {
      _id: ObjectId(req.body.pollId),
      verifiedVoters: {
        $in: [req.body.userId]
      }
    }
  ).exec((err, doc) => {
    if (doc.length > 0) {
      res.json({ result: false});
    } else {
      poll.findOneAndUpdate({
        _id: ObjectId(req.body.pollId)
       },
       {
         $push: {
           verifiedVoters: req.body.userId
         }
       }).exec((error, doc) => {
         if (!error) {
           res.send({ result: true });
         } else {
           res.json(
            {
              success: false,
              message: "Server side error occcurred",
              error: error
            }
           )
         }
       });
    }
  });
};

pollController.createPoll = (req, res, next) => {
  var polldata = new poll(req.body);
  polldata.save((err, data) => {
    if(err) {
      res.json({
        success: false,
        message: "Server side error occcurred",
        err: error
      })
    }
    res.json(data);
  });
};

pollController.updatepoll = (req, res, next) => {
  console.log("ha");
  // req.body.updatedAt = Date.now()
  poll.updateOne({ _id: req.params.id }, req.body, function(err, result) {
    if (result) {
      res.json({
        result: true
      });
    } else
      res.json({
        result: false
      });
  });
};

pollController.getprivatepollinfobyid = (req, res, next) => {
  poll.aggregate(
    [
      {
        $match: {
          _id: ObjectId(req.params.id)
        }
      },
      {
        $lookup: {
          from: "virtualID",
          let: {
            pollid: "$pollster"
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
    function(err, data) {
      if (err) {
        res.json(err);
      } else {
        res.json(data);
      }
    }
  );
};

pollController.getpollinfobyid = (req, res, next) => {
  poll.aggregate(
    [
      {
        $match: {
          _id: ObjectId(req.params.id)
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
};

pollController.getprofilepoll = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId !== null) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  poll.aggregate(
    [
      {
        $match: {
          status: "Open"
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $match: {
          pollster: ObjectId(req.body.userId)
        }
      },
      // {
      //   $match: {
      //     privateSite: false
      //   }
      // },
      {
        $match: {
          privateSiteId: siteValue
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                    },
                    {
                      $eq: ["$privateSiteId", siteValue]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
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

pollController.getpolldetails = (req, res, next) => {
  poll.aggregate(
    [
      {
        $match: {
          _id: ObjectId(req.body.pollid)
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
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

pollController.getprivatepolldetails = (req, res, next) => {
  poll.aggregate(
    [
      {
        $match: {
          _id: ObjectId(req.body.pollid)
        }
      },
      {
        $lookup: {
          from: "virtualID",
          let: {
            pollid: "$pollster"
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
                privateSite:1,
                email: 1,
                _id: 1
              }
            }
          ],
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
        }
      },{
        $lookup: {
          from: "user",
          let: {
            userId: "$pollster.ownerId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"]
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
                privateSite:1,
                email: 1
              }
            }
          ],
          as: "userDetails"
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

pollController.getprivatesubscriberpolldetails = (req, res, next) => {
  poll.aggregate(
    [
      {
        $match: {
          _id: ObjectId(req.body.pollid)
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
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

pollController.getprofilefeedpoll = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  var pollsters = [];
  var pollsterArray = req.body.pollsterset;
  var number = req.body.pageno;
  var skip = (number - 1) * 20;
  var limit;
  if(req.body.limit)
    limit=req.body.limit
  else
   limit = 20;
   
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
        $match: {
          status: {
            $nin: ["PENDING"]
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
        pollsterArray = data;
        pollsterArray.forEach(element => {
          if (element.feedoption === "start") {
            pollsters.push(ObjectId(element.subscribee._id));
          }
        });
        poll.aggregate(
          [
            {
              $match: {
                status: "Open"
              }
            },
            {
              $match: {
                privateSiteId: siteValue
              }
            },
            {
              $match: {
                pollster: { $in: pollsters }
              }
            },
            {
              $match:{
                categories: { $in: req.body.categories }
              }
            },
            {
              $match: {
                country: req.body.country
              }
            },
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "user",
                let: {
                  pollid: "$pollster"
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
                as: "pollster"
              }
            },
            {
              $unwind: "$pollster"
            },
            {
              $lookup: {
                from: "subscription",
                let: {
                  pollid: "$pollster._id"
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$subscriber", ObjectId(req.body.id)]
                          },
                          {
                            $eq: ["$subscribee", "$$pollid"]
                          },
                          {
                            $eq: ["$privateSiteId", siteValue]
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
                as: "subscriptionStatus"
              }
            },
            {
              $lookup: {
                from: "pollresult",
                let: {
                  pollid: "$_id"
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
                            $eq: ["$user", ObjectId(req.body.id)]
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
                as: "pollresult"
              }
            },
            {
              $lookup: {
                from: "retruthtopics",
                let: {
                  pollid: "$_id"
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
                            $eq: ["$user_id", ObjectId(req.body.id)]
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
                as: "retruthtopic"
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
      }
    }
  );
};

pollController.getPollsForSearch = (req, res, next) => {
  var privateSiteId = null;
  if (req.query.privateSiteId) {
    privateSiteId = ObjectId(req.query.privateSiteId);
  }
  poll.aggregate(
    [
      {
        $match: {
          $and: [
            { status: "Open"},
            { privateSiteId: privateSiteId }
          ]
        }
      }, 
      {
        $project: {
          _id: 1,
          tags: 1,
          question: 1
        }
      }

    ], (error, data) => {
      if (data) {
        res.json(data);
      } else {
        res.json({
          success: false,
          error: error
        });
      }
    }
  )
};

pollController.deletepoll = (req, res, next) => {
  poll.findByIdAndUpdate(
    ObjectId(req.body.id),
    {
      $set: {
        status: "Deleted"
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

pollController.updatepollCastCountByAnswer = (req, res, next) => {
  poll.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        pollCastCountByAnswer: req.body
      }
    },
    {
      new: true
    },
    (err, status) => {
      if (status) {
        res.json(status);
      } else {
        res.json({
          result: false
        });
      }
    }
  );
};

pollController.updateBoth = (req, res, next) => {
  poll.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        targetCountryCountByAnswer: req.body.targetCountryCountByAnswer,
        pollCastCountByAnswer: req.body.pollCastCountByAnswer
      }
    },
    {
      new: true
    },
    (err, data) => {
      if (data) {
        res.json(data);
      } else {
        res.json({
          result: false
        });
      }
    }
  );
};

pollController.updatePollResult = (req, res, next) => {
  pollresult.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        result: req.body.result
      }
    },
    {
      new: true
    },
    (err, status) => {
      if (status) {
        res.json(status);
      } else {
        res.json({
          result: false
        });
      }
    }
  );
};

pollController.voteByBoth = (req, res, next) => {
  poll
  .find(
    { _id: ObjectId(req.params.id) },
    {
      pollCastCountByAnswer: 1,
      targetCountryCountByAnswer: 1,
      targetCountryCount: 1,
      pollCastCount: 1
    }
  )
  .exec((err, data) => {
    if(err) {
      res.json({
        success: false,
        message: "Server side error occcurred",
        err: error
      });
      return;
    }
    var result = data[0];
    var insert = {
      pollCastCountByAnswer: result.pollCastCountByAnswer,
      targetCountryCountByAnswer: result.targetCountryCountByAnswer,
      targetCountryCount: result.targetCountryCount,
      pollCastCount: result.pollCastCount
    };
    if (insert.pollCastCountByAnswer[req.body.pinc] === undefined)
      insert.pollCastCountByAnswer[req.body.pinc] = 1;
    else insert.pollCastCountByAnswer[req.body.pinc] += 1;
    if (insert.targetCountryCountByAnswer[req.body.tinc] === undefined)
      insert.targetCountryCountByAnswer[req.body.tinc] = 1;
    else insert.targetCountryCountByAnswer[req.body.tinc] += 1;
    insert.targetCountryCount += 1;
    insert.pollCastCount += 1;
    poll.findByIdAndUpdate(
      ObjectId(req.params.id),
      {
        $set: {
          pollCastCountByAnswer: insert.pollCastCountByAnswer,
          targetCountryCountByAnswer: insert.targetCountryCountByAnswer,
          pollCastCount: insert.pollCastCount,
          targetCountryCount: insert.targetCountryCount
        }
      },
      {
        new: true
      },
      (err, updateVotes) => {
        if (updateVotes) {
        res.json(updateVotes);
      } else {
        res.json({
          success: false,
          message: "Server side error occcurred",
          err: error
        })
      }
    }
    );
  });
};

pollController.votepollCastCountByAnswer = (req, res, next) => {
  poll
  .find(
    { _id: ObjectId(req.params.id) },
    { pollCastCountByAnswer: 1, pollCastCount: 1 }
  )
  .exec((err, data) => {
    if(err) {
      res.json({
        success: false,
        message: "Server side error occcurred",
        err: error
      })
      return;
    }
    var result = data[0];
    var insert = {
      pollCastCountByAnswer: result.pollCastCountByAnswer,
      pollCastCount: result.pollCastCount
    };
    if (insert.pollCastCountByAnswer[req.body.pinc] == undefined)
      insert.pollCastCountByAnswer[req.body.pinc] = 1;
    else insert.pollCastCountByAnswer[req.body.pinc] += 1;
    insert.pollCastCount += 1;
    poll.findByIdAndUpdate(
      ObjectId(req.params.id),
      {
        $set: {
          pollCastCountByAnswer: insert.pollCastCountByAnswer,
          pollCastCount: insert.pollCastCount
        }
      },
      {
        new: true
      },
      (err, updateVotes) => {
        if(err){
          res.json({
            success: false,
            message: "Server side error occcurred",
            err: error
          });
          return;
        }
        res.json(updateVotes);
      }
    );
  });
};

pollController.pollResult = (req, res, next) => {
  var pollres = new pollresult();
  pollres.country = req.body.country;
  pollres.user = ObjectId(req.body.user);
  pollres.poll = req.body.poll;
  pollres.result = req.body.result;
  pollres.createdAt=new Date();
  pollres.save((err, data) => {
    res.send(data);
  });
};

pollController.followTopic = (req, res, next) => {
  poll
  .update(
    { _id: req.body.id },
    { $addToSet: { pollSubscription: ObjectId(req.body.userid) } }
  )
  .exec((err, data) => {
    if(err) {
      res.json({err});
      return;
    }
    res.send(data);
  });
};

pollController.unfollowTopic = (req, res, next) => {
  poll
  .update(
    { _id: req.body.id },
    {
      $pull: {
        pollSubscription: { $in: [ObjectId(req.body.userid)] }
      }
    },
    { multi: true }
  )
  .exec((err, data) => {
    if(err) {
      res.send(err)
      return ;
    }
    res.send(data);
  });
};

pollController.flagTopic = (req, res, next) => {
  poll
  .update(
    { _id: req.body.id },
    { $addToSet: { flagPollByUserIds: ObjectId(req.body.userid) } }
  )
  .exec((err, data) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(data);
  });
};

pollController.unflagTopic = (req, res, next) => {
  poll
    .update(
      { _id: req.body.id },
      {
        $pull: {
          flagPollByUserIds: { $in: [ObjectId(req.body.userid)] }
        }
      },
      { multi: true }
    )
    .exec((err, data) => {
      if(err) {
        res.send(err);
        return;
      }
      res.send(data);
    });
};

pollController.getpollresultbyworld = (req, res, next) => {
  pollresult.aggregate(
    [
      {
        $match: {
          user: ObjectId(req.body.id)
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "poll",
          let: {
            pollid: "$poll"
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
                      $eq: ["$privateSite", false]
                    }
                  ]
                  
                }
              },
              // $match: {
              //   $expr: {
              //     $categories: { $in: ["Alerts"] }
              //   }
              // }
            },
            {
              $project: {
                pollOptions: 1,
                tags: 1,
                flagPollByUserIds: 1,
                pollSubscription: 1,
                pollRetruthCount: 1,
                pollCastCount: 1,
                pollCommentCount: 1,
                targetCountryCount: 1,
                disableComments: 1,
                pollTags: 1,
                pollCastCountByAnswer: 1,
                pollster: 1,
                country: 1,
                subscribers: 1,
                question: 1,
                expires: 1,
                status: 1,
                pollOptionsType: 1,
                retruth_by: 1,
                expires: 1,
                articleInfo: 1,
                targetCountryCountByAnswer: 1,
                privacyOptions: 1,
                privateSite:1,
                privacyOptions:1,
                createdFor:1,
                comment: 1,
                _id: 1,
                verifiedVote: 1,
                categories: 1
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
          from: "user",
          let: {
            pollid: "$poll.pollster"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$pollid"]
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
                profilePicture: 1
              }
            }
          ],
          as: "pollster"
        }
      }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        var tempdata=[];
        data.forEach(element => {
          const found = element.poll.categories.some(r=> req.body.categories.indexOf(r) >= 0);
          if(found){
            tempdata.push(element)
          }
        });
        res.json(tempdata);
      }
    }
  );
};

pollController.getprivatepollresultbyworld = (req, res, next) => {
  pollresult.aggregate(
    [
      {
        $match: {
          user: ObjectId(req.body.id)
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "poll",
          let: {
            pollid: "$poll"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$pollid"]
                }
              },
              // $match: {
              //   $expr: {
              //     $categories: { $in: ["Alerts"] }
              //   }
              // }
            },
            {
              $project: {
                pollOptions: 1,
                tags: 1,
                flagPollByUserIds: 1,
                pollSubscription: 1,
                pollRetruthCount: 1,
                pollCastCount: 1,
                pollCommentCount: 1,
                targetCountryCount: 1,
                disableComments: 1,
                pollTags: 1,
                pollCastCountByAnswer: 1,
                pollster: 1,
                country: 1,
                subscribers: 1,
                question: 1,
                expires: 1,
                status: 1,
                pollOptionsType: 1,
                retruth_by: 1,
                expires: 1,
                articleInfo: 1,
                targetCountryCountByAnswer: 1,
                privacyOptions: 1,
                privateSite:1,
                privacyOptions:1,
                createdFor:1,
                comment: 1,
                _id: 1,
                categories: 1
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
          from: "virtualID",
          let: {
            pollid: "$poll.pollster"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$pollid"]
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
                address: 1
              }
            }
          ],
          as: "pollster"
        }
      }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        var tempdata=[];
        data.forEach(element => {
          const found = element.poll.categories.some(r=> req.body.categories.indexOf(r) >= 0);
          if(found){
            tempdata.push(element)
          }
        });
        res.json(tempdata);
      }
    }
  );
};

pollController.retruthtopic = (req, res, next) => {
  var rte = new retruthtopics();
  rte.user_id = req.body.user_id;
  rte.poll_id = ObjectId(req.body.poll_id);
  rte.retruth_reason = req.body.retruth_reason;
  rte.save((err, data) => {
    if(err) {
      res.status(err);
      return;
    }
    res.send(data);
  });
};

pollController.removeRetruth = (req, res, next) => {
  retruthtopics.remove({ _id: req.params.id }).exec((err, data) => {
    if(err) {
      res.status(err);
      return;
    }
    res.send(data);
  });
};

pollController.addUserToRetruth = (req, res, next) => {
  poll
    .update(
      { _id: req.body.pollid },
      {
        $inc: { pollRetruthCount: 1 },
        $addToSet: { retruth_by: req.body.username,retruth_by_ids:req.body.userid },
      }
    )
    .exec((err, data) => {
      if(err) {
        res.status(err);
        return;
      }
      res.send(data);
    });
};

pollController.removeUserToRetruth = (req, res, next) => {
  poll
    .update(
      { _id: req.body.pollid },
      {
        $pull: {
          retruth_by: { $in: [req.body.username] },
          retruth_by_ids: { $in: [req.body.userid] }
        },
        $inc: { pollRetruthCount: 1 }
      }
    )
    .exec((err, data) => {
      if(err) {
        res.status(err);
        return;
      }
      res.json(data);
    });
};

pollController.getprofilefeedcount = (req, res, next) => {
  var pollsters = [];
  var pollsterArray = req.body.pollsterset;
  pollsterArray.forEach(element => {
    if (element.feedoption === "start") {
      pollsters.push(ObjectId(element.subscribee._id));
    }
  });
  poll.countDocuments({pollster: { $in: pollsters },categories: { $in: req.body.categories },status:"Open",country:req.body.country}).exec((err, data) => {
    if(err) {
      res.status(err);
      return;
    }
    // console.log(data);
    res.json(data)
  });
};

pollController.getprofilefeedcountbyworld = (req, res, next) => {
  var pollsters = [];
  var pollsterArray = req.body.pollsterset;
  pollsterArray.forEach(element => {
    if (element.feedoption === "start") {
      pollsters.push(ObjectId(element.subscribee._id));
    }
  });
  poll.countDocuments({pollster: { $in: pollsters },status:"Open",categories: { $in: req.body.categories }}).exec((err, data) => {
    if(err) {
      res.status(err);
      return;
    }
    res.json(data)
  });
};

pollController.searchPolls = (req, res, next) => {
  var data = ".*" + req.body.searchParam + ".*";
  poll.aggregate(
    [
      {
        $match: {
          status: "Open"
        }
      },
      {
        $match: {
          question: { $regex: data, $options: "i" }
        }
      },
      {
        $match: {
          categories: { $in: req.body.categories }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
                email: 1,
                profilePicture: 1,
                _id: 1
              }
            }
          ],
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
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

pollController.getpollresult = (req, res, next) => {
  pollresult.aggregate(
    [
      {
        $match: {
          user: ObjectId(req.body.id)
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "poll",
          let: {
            pollid: "$poll"
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
                      $eq: ["$country", req.body.country]
                    },
                    {
                      $eq: ["$privateSite", false]
                    }
                  ]
                }
              },
            },
            {
              $project: {
                pollOptions: 1,
                tags: 1,
                flagPollByUserIds: 1,
                pollSubscription: 1,
                pollRetruthCount: 1,
                pollCastCount: 1,
                pollCommentCount: 1,
                targetCountryCount: 1,
                disableComments: 1,
                pollTags: 1,
                pollCastCountByAnswer: 1,
                pollster: 1,
                country: 1,
                subscribers: 1,
                question: 1,
                expires: 1,
                status: 1,
                pollOptionsType: 1,
                retruth_by: 1,
                expires: 1,
                privateSite:1,
                privacyOptions:1,
                createdFor:1,
                articleInfo: 1,
                targetCountryCountByAnswer: 1,
                privacyOptions: 1,
                comment: 1,
                _id: 1,
                verifiedVote: 1,
                categories: 1
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
          from: "user",
          let: {
            pollid: "$poll.pollster"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$pollid"]
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
                profilePicture: 1
              }
            }
          ],
          as: "pollster"
        },
      }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        var tempdata=[];
        data.forEach(element => {
          const found = element.poll.categories.some(r=> req.body.categories.indexOf(r) >= 0);
          if(found){
            tempdata.push(element)
          }
        });
         res.json(tempdata);
      }
    }
  );
};

pollController.getprivatepollresult = (req, res, next) => {
  pollresult.aggregate(
    [
      {
        $match: {
          user: ObjectId(req.body.id)
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "poll",
          let: {
            pollid: "$poll"
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
                      $eq: ["$country", req.body.country]
                    }
                  ]
                }
              },
            },
            {
              $project: {
                pollOptions: 1,
                tags: 1,
                flagPollByUserIds: 1,
                pollSubscription: 1,
                pollRetruthCount: 1,
                pollCastCount: 1,
                pollCommentCount: 1,
                targetCountryCount: 1,
                disableComments: 1,
                pollTags: 1,
                pollCastCountByAnswer: 1,
                pollster: 1,
                country: 1,
                subscribers: 1,
                question: 1,
                expires: 1,
                status: 1,
                pollOptionsType: 1,
                retruth_by: 1,
                expires: 1,
                privateSite:1,
                privacyOptions:1,
                createdFor:1,
                articleInfo: 1,
                targetCountryCountByAnswer: 1,
                privacyOptions: 1,
                comment: 1,
                _id: 1,
                categories: 1
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
          from: "virtualID",
          let: {
            pollid: "$poll.pollster"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$pollid"]
                    }
                  ]
                } 
              }
            },
            {
              $project: {
                privateSite:1,
                ownerId: 1,
                _id: 1
              }
            }
          ],
          as: "pollster"
        },
      },
      { "$unwind": "$pollster" },
      {
        $lookup: {
          from: "user",
          let: {
            userId: "$pollster.ownerId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"]
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
                privateSite:1,
                email: 1,
              }
            }
          ],
          as: "userDetails"
        }
      }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        var tempdata=[];
        data.forEach(element => {
          const found = element.poll.categories.some(r=> req.body.categories.indexOf(r) >= 0);
          if(found){
            tempdata.push(element)
          }
        });
        res.json(tempdata);
      }
    }
  );
};

pollController.getprivatesubscriberpollresult = (req, res, next) => {
  pollresult.aggregate(
    [
      {
        $match: {
          user: ObjectId(req.body.id)
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "poll",
          let: {
            pollid: "$poll"
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
                      $eq: ["$country", req.body.country]
                    }
                  ]
                }
              },
            },
            {
              $project: {
                pollOptions: 1,
                tags: 1,
                flagPollByUserIds: 1,
                pollSubscription: 1,
                pollRetruthCount: 1,
                pollCastCount: 1,
                pollCommentCount: 1,
                targetCountryCount: 1,
                disableComments: 1,
                pollTags: 1,
                pollCastCountByAnswer: 1,
                pollster: 1,
                country: 1,
                subscribers: 1,
                question: 1,
                expires: 1,
                status: 1,
                pollOptionsType: 1,
                retruth_by: 1,
                expires: 1,
                privateSite:1,
                privacyOptions:1,
                createdFor:1,
                articleInfo: 1,
                targetCountryCountByAnswer: 1,
                privacyOptions: 1,
                comment: 1,
                _id: 1,
                categories: 1
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
          from: "user",
          let: {
            pollid: "$poll.pollster"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$pollid"]
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
                privateSite:1,
                email: 1,
              }
            }
          ],
          as: "pollster"
        },
      }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        var tempdata=[];
        data.forEach(element => {
          const found = element.poll.categories.some(r=> req.body.categories.indexOf(r) >= 0);
          if(found){
            tempdata.push(element)
          }
        });
        res.json(tempdata);
      }
    }
  );
};

pollController.getprofilefeedpollbyworld = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  var pollsters = [];
  var number = req.body.pageno;
  var skip = (number - 1) * 20;
  var limit;
  if(req.body.limit)
    limit=req.body.limit
  else
   limit = 20;

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
        $match: {
          status: {
            $nin: ["PENDING"]
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
        pollsterArray = data;
        pollsterArray.forEach(element => {
          if (element.feedoption === "start") {
            pollsters.push(ObjectId(element.subscribee._id));
          }
        });
        poll.aggregate(
          [
            {
              $match: {
                status: "Open"
              }
            },
            {
              $match: {
                categories: { $in: req.body.categories }
              }
            },
            {
              $match: {
                privateSiteId: siteValue
              }
            },
            {
              $lookup: {
                from: "subscription",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$subscriber", ObjectId(req.body.id)]
                          },
                          {
                            $eq: ["$privateSiteId", siteValue]
                          }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      id: 1
                    }
                  }
                ],
                as: "subscriptionsset"
              }
            },
            {
              $match: {
                pollster: { $in: pollsters }
              }
            },
            {
              $skip: skip
            },
            {
              $limit: limit
            },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "user",
                let: {
                  pollid: "$pollster"
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
                as: "pollster"
              }
            },
            {
              $unwind: "$pollster"
            },
            {
              $lookup: {
                from: "subscription",
                let: {
                  pollid: "$pollster._id"
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
                            $eq: ["$subscriber", ObjectId(req.body.id)]
                          },
                          {
                            $eq: ["$privateSiteId", siteValue]
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
                as: "subscriptionStatus"
              }
            },
            {
              $lookup: {
                from: "pollresult",
                let: {
                  pollid: "$_id"
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
                            $eq: ["$user", ObjectId(req.body.id)]
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
                as: "pollresult"
              }
            },
            {
              $lookup: {
                from: "retruthtopics",
                let: {
                  pollid: "$_id"
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
                            $eq: ["$user_id", ObjectId(req.body.id)]
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
                as: "retruthtopic"
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
      }
    }
  );
};

pollController.getownerfeedpollbyworld = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  var pollsters = [];
  var number = req.body.pageno;
  var skip = (number - 1) * 20;
  var limit;
  if(req.body.limit)
    limit=req.body.limit
  else
   limit = 20;

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
          from: "virtualID",
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
        pollsterArray = data;
        pollsterArray.forEach(element => {
          if (element.feedoption === "start") {
            pollsters.push(ObjectId(element.subscribee._id));
          }
        });
        poll.aggregate(
          [
            {
              $match: {
                status: "Open"
              }
            },
            {
              $match: {
                categories: { $in: req.body.categories }
              }
            },
            {
              $match: {
                privateSiteId: siteValue
              }
            },
            {
              $lookup: {
                from: "subscription",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$subscriber", ObjectId(req.body.id)]
                          },
                          {
                            $eq: ["$privateSiteId", siteValue]
                          }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      id: 1
                    }
                  }
                ],
                as: "subscriptionsset"
              }
            },
            {
              $match: {
                pollster: { $in: pollsters }
                // pollster: { $in: "subscriptionsset" }
              }
            },
            {
              $skip: skip
            },
            {
              $limit: limit
            },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "virtualID",
                let: {
                  pollid: "$pollster"
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
                      id: 1
                    }
                  }
                ],
                as: "pollster"
              }
            },
            {
              $unwind: "$pollster"
            },
            {
              $lookup: {
                from: "subscription",
                let: {
                  pollid: "$pollster._id"
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
                            $eq: ["$subscriber", ObjectId(req.body.id)]
                          },
                          {
                            $eq: ["$privateSiteId", siteValue]
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
                as: "subscriptionStatus"
              }
            },
            {
              $lookup: {
                from: "pollresult",
                let: {
                  pollid: "$_id"
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
                            $eq: ["$user", ObjectId(req.body.id)]
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
                as: "pollresult"
              }
            },
            {
              $lookup: {
                from: "retruthtopics",
                let: {
                  pollid: "$_id"
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
                            $eq: ["$user_id", ObjectId(req.body.id)]
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
                as: "retruthtopic"
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
      }
    }
  );
};

pollController.updatePollExpire = (req, res, next) => {
  poll.findByIdAndUpdate(
    req.body.id,
    {
      $set: {
        expires: req.body.expires,
      }
    },
    {
      new: true
    },
    (err, updatePollExpire) => {
      if(err) {
        res.status(err);
        return;
      }
      res.send(updatePollExpire);
    }
  );  
};

pollController.ispolldeleted = (req, res, next) => {
  poll.find({_id:ObjectId(req.params.id)},{status:1}).exec((err,data)=>{
    if(data.length>0)
    {
      if(data[0].status==='Deleted'){
        res.json({
          result:true,
          isdelete:true
        })
      }
      else
      {
        res.json({
          result:true,
          isdelete:false
        })
      }
    }
    else{
      res.json({
        result:true,
        isdelete:true
      })
    }
  });
};

pollController.deleteArticle = (req, res, next) => {
  poll.findByIdAndUpdate(
    ObjectId(req.body.id),
    {
      $set: {
        articleInfo: req.body.article
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

pollController.getprofiletopics = (req, res, next) => {
  var siteValue = null;
  if (req.body.privateSiteId !== null) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  var number = req.body.pageno;
  var skip = (number - 1) * 20;
  var limit;
  if(req.body.limit)
    limit=req.body.limit
  else
   limit = 20;
  poll.aggregate(
    [
      {
        $match: {
          status: "Open"
        }
      },
      {
        $match: {
          privateSite: false
        }
      },
      {
        $match:{
          categories: { $in: req.body.categories }
        }
      },
      {
        $match: {
          country: req.body.country
        }
      },
      {
        $match:{
            $or:[
              {
                  siteOwnerId:ObjectId(req.body.id)
              },
              {
                  retruth_by_ids: { $in: [req.body.id] }
              },
              {
                  pollster:ObjectId(req.body.id)
              }
            ]
        }
      },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                    },
                    {
                      $eq: ["$subscribee", "$$pollid"]
                    },
                    {
                      $eq: ["$privateSiteId", siteValue]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.id)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.id)]
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
          as: "retruthtopic"
        }
      }
    ],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        // console.log(data);
        res.json(data);
      }
    }
  );
};

pollController.getprofiletopiccount = (req, res, next) => {
  poll.countDocuments({$or:[{retruth_by_ids: { $in: req.body.id}},{pollster:ObjectId(req.body.id)},{siteOwnerId:ObjectId(req.body.id)}],categories: { $in: req.body.categories },status:"Open",country:req.body.country}).exec((err, data) => {
    if(err) {
      res.status(err);
      return;
    }
    res.json(data)
  });
};

pollController.getprofiletopiccountbyworld = (req, res, next) => {
  poll.countDocuments({$or:[{retruth_by_ids: { $in: req.body.id}},{pollster:ObjectId(req.body.id)},{siteOwnerId:ObjectId(req.body.id)}],categories: { $in: req.body.categories },status:"Open"}).exec((err, data) => {
    // console.log(data);
    if(err) {
      res.status(err);
      return;
    }
    res.json(data)
  });
};

pollController.recentcount = (req, res, next) => {
  poll
    .aggregate([
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$siteOwnerId"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatusForPrivate"
        }
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatus"
        }
      },
      {
        $match: {
          $or: [
            {
              $and: [
                { "privacyOptions.poll.preference": "Public" },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { pollster: ObjectId(req.body.id) },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { siteOwnerId: ObjectId(req.body.id) },
                { privateSite: true }
              ]
            },
            {
              $and: [
                { "subscriptionStatusForPrivate.0._id": { $exists: true } },
                { privateSite: { $eq: true } },
                { privateSiteSubsOnly: { $eq: true } },
                { "subscriptionStatusForPrivate.0.status": { $eq: "ACCEPTED" } }
              ]
            },
            {
              $and: [
                { "privacyOptions.poll.preference": "Subscribers" },
                { privateSite: { $eq: false } },
                { "SubscribersList.0.status": { $eq: "ACCEPTED" } }
              ]
            },
            {
              $and: [
                { "privacyOptions.poll.preference": "Specific_Subscribers" },
                {
                  "Specific_SubscribersList.subscribers": { $in: [req.body.id] }
                },
                { privateSite: { $eq: false } }
              ]
            }
          ]
        }
      },
      {
        $match: {
          status: "Open",
          categories: { $in: req.body.categories },
          country:req.body.country
        }
      },
      {
        $group: {
          _id: null,
          pollscount: { $sum: 1 }
        }
      }
    ])
    .exec((err, data) => {
      if (data && data.length > 0) res.json(data[0].pollscount);
      else res.json(0);
    });
};

pollController.topcount = (req, res, next) => {
  poll
    .aggregate([
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$siteOwnerId"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatusForPrivate"
        }
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatus"
        }
      }, 
      {
        $match: {
          $or: [
            {
              $and: [
                { "privacyOptions.poll.preference": "Public" },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { pollster: ObjectId(req.body.id) },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { siteOwnerId: ObjectId(req.body.id) },
                { privateSite: true }
              ]
            },
            {
              $and: [
                {"subscriptionStatusForPrivate.0._id": {  "$exists": true } },
                {privateSite:{$eq:true}},
                {privateSiteSubsOnly:{$eq:true}},
                {"subscriptionStatusForPrivate.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                {"privacyOptions.poll.preference": 'Subscribers' },
                {privateSite:{$eq:false}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { 'privacyOptions.poll.preference':'Specific_Subscribers'},
                {"Specific_SubscribersList.subscribers":{$in:[req.body.id]}},
                {privateSite:{$eq:false}}
              ]
            }
          ]
        }
      },
      {
        $match: {
          status: "Open",
          categories:{$in:req.body.categories},
          pollCastCount: { $gte: 1 } ,
          country:req.body.country
        }
      },
      {
        $group: {
          _id: null,
          pollscount: { $sum: 1 },
        }
      }
    ])
    .exec((err, data) => {
       if (data.length > 0) res.json(data[0].pollscount);
       else res.json(0);
    });
};

pollController.trendingcount = (req, res, next) => {
  var dateNow = new Date();
  var dateAgo = new Date(dateNow);
  dateAgo.setDate(dateNow.getUTCDate() - 1);
  poll
    .aggregate([
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$siteOwnerId"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatusForPrivate"
        }
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatus"
        }
      }, 
      {
        $match: {
          $or: [
            {
              $and: [
                { "privacyOptions.poll.preference": "Public" },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { pollster: ObjectId(req.body.id) },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { siteOwnerId: ObjectId(req.body.id) },
                { privateSite: true }
              ]
            },
            {
              $and: [
                {"subscriptionStatusForPrivate.0._id": {  "$exists": true } },
                {privateSite:{$eq:true}},
                {privateSiteSubsOnly:{$eq:true}},
                {"subscriptionStatusForPrivate.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                {"privacyOptions.poll.preference": 'Subscribers' },
                {privateSite:{$eq:false}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { 'privacyOptions.poll.preference':'Specific_Subscribers'},
                {"Specific_SubscribersList.subscribers":{$in:[req.body.id]}},
                {privateSite:{$eq:false}}
              ]
            }
          ]
        }
      },
      {
        $match: {
          status: "Open",
          categories:{$in:req.body.categories},
          createdAt: {
            $gte: dateAgo,
            $lte: dateNow
          },
          country:req.body.country
        }
      },
      {
        $group: {
          _id: null,
          pollscount: { $sum: 1 },
        }
      }
    ])
    .exec((err, data) => {
      // console.log(data);
       if (data.length > 0) res.json(data[0].pollscount);
       else res.json(0);
    });
};

pollController.recentcountbyworld = (req, res, next) => {
  poll
    .aggregate([
      {
        $lookup: {
          from: "subscription",
          let: {
            pollster: "$pollster"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$subscribee", "$$pollster"]
                    },
                    {
                      $eq: ["$subscriber", ObjectId(req.body.id)]
                    },
                    {
                      $eq: ["privateSiteId", null]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                status: 1
              }
            }
          ],
          as: "subscriptionStatus"
        }
      },
      {
        $match: {
          $or: [
            {
              $and: [
                { "privacyOptions.poll.preference": "Public" },
                { privateSite: false },
                { "privacyOptions.poll.preference": {$ne : "Subscribers"} },
                { "privacyOptions.poll.preference": {$ne : "Specific_Subscribers"} }
              ]
            },
            {
              $and: [
                { pollster: ObjectId(req.body.id) },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { "privacyOptions.poll.preference": "Subscribers" },
                { privateSite: { $eq: false } },
                { "subscriptionStatus.status": { $eq: "ACCEPTED" } }
              ]
            },
            {
              $and: [
                { "privacyOptions.poll.preference": "Specific_Subscribers" },
                {
                  "privacyOptions.poll.subscribers": { $in: [req.body.id] }
                },
                { privateSite: { $eq: false } }
              ]
            }
          ]
        }
      },
      {
        $match: {
          status: "Open",
          categories: { $in: req.body.categories }
        }
      },
      {
        $group: {
          _id: null,
          pollscount: { $sum: 1 },
        }
      },
    ])
    .exec((err, data) => {
      if (data.length > 0) res.json(data[0].pollscount);
      else res.json(0);
    });
};

pollController.topcountbyworld = (req, res, next) => {
  poll
    .aggregate([
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$siteOwnerId"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatusForPrivate"
        }
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatus"
        }
      }, 
      {
        $match: {
          $or: [
            {
              $and: [
                { "privacyOptions.poll.preference": "Public" },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { pollster: ObjectId(req.body.id) },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { siteOwnerId: ObjectId(req.body.id) },
                { privateSite: true }
              ]
            },
            {
              $and: [
                {"subscriptionStatusForPrivate.0._id": {  "$exists": true } },
                {privateSite:{$eq:true}},
                {privateSiteSubsOnly:{$eq:true}},
                {"subscriptionStatusForPrivate.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                {"privacyOptions.poll.preference": 'Subscribers' },
                {privateSite:{$eq:false}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { 'privacyOptions.poll.preference':'Specific_Subscribers'},
                {"Specific_SubscribersList.subscribers":{$in:[req.body.id]}},
                {privateSite:{$eq:false}}
              ]
            }
          ]
        }
      },
      {
        $match: {
          status: "Open",
          categories:{$in:req.body.categories},
          pollCastCount: { $gte: 1 } ,
        }
      },
      {
        $group: {
          _id: null,
          pollscount: { $sum: 1 },
        }
      }
    ])
    .exec((err, data) => {
       if (data.length > 0) res.json(data[0].pollscount);
       else res.json(0);
    });
};

pollController.trendingcountbyworld = (req, res, next) => {
  var dateNow = new Date();
  var dateAgo = new Date(dateNow);
  dateAgo.setDate(dateNow.getUTCDate() - 1);
  poll
    .aggregate([
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$siteOwnerId"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatusForPrivate"
        }
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster"
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
                      $eq: ["$subscriber", ObjectId(req.body.id)]
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
          as: "subscriptionStatus"
        }
      }, 
      {
        $match: {
          $or: [
            {
              $and: [
                { "privacyOptions.poll.preference": "Public" },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { pollster: ObjectId(req.body.id) },
                { privateSite: false }
              ]
            },
            {
              $and: [
                { siteOwnerId: ObjectId(req.body.id) },
                { privateSite: true }
              ]
            },
            {
              $and: [
                {"subscriptionStatusForPrivate.0._id": {  "$exists": true } },
                {privateSite:{$eq:true}},
                {privateSiteSubsOnly:{$eq:true}},
                {"subscriptionStatusForPrivate.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                {"privacyOptions.poll.preference": 'Subscribers' },
                {privateSite:{$eq:false}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { 'privacyOptions.poll.preference':'Specific_Subscribers'},
                {"Specific_SubscribersList.subscribers":{$in:[req.body.id]}},
                {privateSite:{$eq:false}}
              ]
            }
          ]
        }
      },
      {
        $match: {
          status: "Open",
          categories:{$in:req.body.categories},
          createdAt: {
            $gte: dateAgo,
            $lte: dateNow
          }
        }
      },
      {
        $group: {
          _id: null,
          pollscount: { $sum: 1 },
        }
      }
    ])
    .exec((err, data) => {
       if (data.length > 0) res.json(data[0].pollscount);
       else res.json(0);
    });
};

pollController.privateSitePoll = (req, res, next) => {
  poll.updateMany({privateSite:{$exists:false}}, { $set: { privateSite: false } })
  .exec((err, data) => {
    if(err) {
      res.status(err);
      return;
    }
      res.send(data);
  });
};

pollController.updatePollToPrivate = (req, res, next) => {
  poll.updateMany(
    {
      privateSite:false,
      pollster:ObjectId(req.body.id)
    }, 
    { 
      $set: { 
        privateSite: true,
        createdFor:req.body.privateSiteSettings
      } 
    })
  .exec((err, data) => {
    if(err) {
      res.status(err);
      return;
    }
      res.send(data);
  });
};

pollController.searchTags = (req, res, next) => {
  let siteValue = null;
  let isPrivateSite = false;
  if (req.body.privatesite) {
    siteValue = ObjectId(req.body.privatesite);
    isPrivateSite = true;
  }
  poll.aggregate(
    [
      {
        $match: {
          status: "Open"
        }
      },
      {
        $match: {
          privateSite: isPrivateSite
        }
      },
      {
        $match: {
          siteOwnerId: siteValue
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "user",
          let: {
            pollid: "$pollster"
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
                email: 1,
                profilePicture: 1,
                _id: 1
              }
            }
          ],
          as: "pollster"
        }
      },
      {
        $unwind: "$pollster"
      },
      {
        $lookup: {
          from: "subscription",
          let: {
            pollid: "$pollster._id"
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
                      $eq: ["$subscriber", ObjectId(req.body.user)]
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
          as: "subscriptionStatus"
        }
      },
      {
        $lookup: {
          from: "pollresult",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user", ObjectId(req.body.user)]
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
          as: "pollresult"
        }
      },
      {
        $lookup: {
          from: "retruthtopics",
          let: {
            pollid: "$_id"
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
                      $eq: ["$user_id", ObjectId(req.body.user)]
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
          as: "retruthtopic"
        }
      }
    ],
    (error, documents) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Server side error occurred",
          error: error
        });
      } else {
        if (documents && documents.length > 0) {
          let polls = documents.filter((poll) => {
            if (poll && poll["tags"] && poll["tags"].length > 0) {
              return poll["tags"].some((tag) => { 
                return tag.indexOf(req.body.tag) >= 0; 
              });
            }
          });
          res.status(200).json({
            success: true,
            data: polls,
            message: "Data retrieval successful"
          });
        } else {
          res.status(200).json({
            success: true,
            data: [],
            message: "Data retrieval successful"
          });
        }
      }
    }
  );
};

pollController.getTags = (req, res, next) => {
  let siteValue = null;
  let isPrivateSite = false;
  if (req.body.privatesite) {
    siteValue = ObjectId(req.body.privatesite);
    isPrivateSite = true;
  }
  poll.aggregate(
    [
      {
        $match: {
          status: "Open"
        }
      },
      {
        $match: {
          privateSite: isPrivateSite
        }
      },
      {
        $match: {
          siteOwnerId: siteValue
        }
      }
    ], (error, documents) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Server side error occurred",
          error: error
        });
      } else {
        if (documents && documents.length > 0) {
          let tags = [];
          documents.forEach((poll) => {
            if (poll.tags.length > 0) {
              poll.tags.forEach((tag) => {
                if (!tags.includes(tag)) {
                  tags.push(tag)
                }
              });
            }
          });

          res.status(200).json({
            success: true,
            tags: tags,
            message: "Data retrieval successful"
          });
        } else {
          res.status(200).json({
            success: true,
            tags: [],
            message: "Data retrieval successful"
          });
        }
      }
    });
};

module.exports = pollController;