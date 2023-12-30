var poll = require("../models/Poll");
const { ObjectId } = require("mongodb");
const _ = require("lodash");

privateSitePollController = () => { };

privateSitePollController.getsubscriberrecentpollsbyworld = (req, res, next) => {   
  let skip = req.body.range;
  var userIdArray=[];
  if(req.body.id){
    userIdArray.push(req.body.id);
  }
    var limit;
    if(req.body.limit && req.body.limit > 0)
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
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            }
          },
        {
            $match: {
            categories: { $in: req.body.categories }
            }
        },
        {
            $match:{
                siteOwnerId:ObjectId(req.body.siteOwnerId)
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
                from: "subscription",
                let: {
                pollid: ObjectId(req.body.userId)
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
                as: "subscriptionStatusInPrivate"
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
            subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
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
            SubscribersList:{$push:"$subscriptionStatusInPrivate"},
            Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
            }
        },
        {
            $match: {
            $or: [
                {
                    isOwn:{
                    $gte:1
                    }
                },
                // {
                // siteOwnerId:ObjectId(req.body.siteOwnerId)
                // // $and:[
                // //   {
                // //     privateSite:{$eq:true}
                // //   },
                //     // {siteOwnerId:ObjectId(req.body.siteOwnerId)}
                // // ]
                // },
                {
                $and:[
                    {Public: {
                        $gte: 1
                    }},
                {privateSite:{$eq:true}}                  
                    ]
                },
                {
                $and: [
                    {"Subscribers": { $gte:1 } },
                    {privateSite:{$eq:true}},
                    {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
                ]
                },
                {
                $and: [
                    { Specific_Subscribers: { $gte: 1 } },
                    {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                    {privateSite:{$eq:true}}
                ]
                }
            ]
            }
        },
        { $sort: { createdAt: -1 } },
        // {$skip :skip},
        // {
        //     $limit:limit
        // }
        ], (err, data) =>{
        if (err) {
            res.status(404).json(err);
            
        } else {
            res.status(200).json(data);
        }
        }
    );
};

privateSitePollController.getrecentpolls = (req, res, next) => {
    let skip = req.body.range;
    var userIdArray=[];
    if(req.body.id){
      userIdArray.push(req.body.id);
    }
    let limit = 10;
    if(req.body.limit && req.body.limit > 0) {
      limit=req.body.limit
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
            categories: { $in: req.body.categories }
          }
        },
        {
          $match: {
            $or: [
              { expires: { "$gte": new Date() } },
              { expires: { "$eq": null }}
            ]
          }
        },
        {
            $match:{
                siteOwnerId:ObjectId(req.body.siteOwnerId)
            }
        },

        {
          $match: {
            country: req.body.country
          }
        },
        { $sort: { createdAt: -1 } },
        {$skip: skip},
        {
          $limit: limit
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
                  privateSite:1,
                  ownerId: 1,
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
              from: "subscription",
              let: {
                pollid: ObjectId(req.body.userId)
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
              as: "subscriptionStatusInPrivate"
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
            subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
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
            userDetails: {$first: "$userDetails"},
            retruthtopic:{$first:"$retruthtopic"},
            pollresult:{$first:"$pollresult"},
            SubscribersList:{$push:"$subscriptionStatusInPrivate"},
            Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
          }
        },
        {
          $match: {
            $or: [
              {
                  isOwn:{
                    $gte:1
                  }
              },
              // {
              //   siteOwnerId:ObjectId(req.body.siteOwnerId)
              //   // $and:[
              //   //   {
              //   //     privateSite:{$eq:true}
              //   //   },
              //     // {siteOwnerId:ObjectId(req.body.siteOwnerId)}
              //   // ]
              // },
              {
                $and:[
                    {Public: {
                      $gte: 1
                    }},
                    {privateSite:{$eq:true}}                  
                  ]
              },
              {
                $and: [
                  {"Subscribers": { $gte:1 } },
                  {privateSite:{$eq:true}},
                  {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
                ]
              },
              {
                $and: [
                  { Specific_Subscribers: { $gte: 1 } },
                  {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                  {privateSite:{$eq:true}}
                ]
              }
            ]
          }
        },
        { $sort: { createdAt: -1 } },
        // {$skip: skip},
        // {
        //   $limit: limit
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

privateSitePollController.getallrecentpolls = (req, res) => {
  if (req.query.data ) {
    let data = JSON.parse(req.query.data)
    let skip = data.range;
    var userIdArray=[];
    if(data.id){
      userIdArray.push(data.id);
    }
    var limit;
    if(data.limit && data.limit > 0)
      limit=data.limit
    else{
      limit = 20;
    }
    var toDate = new Date()
    var fromDate = new Date(toDate);
    fromDate.setDate(toDate.getUTCDate() - 1);
    if(data.toDate) {
      toDate = new Date(data.toDate);
      toDate.setDate(toDate.getDate()+1)
    }
    if(data.fromDate) {
      fromDate = new Date(data.fromDate);
    }
    if(data.location === "world") {
      poll.aggregate(
        [
        {
            $match: {
            status: "Open"
            }
        },
        {
          $match :             
            {
              createdAt: {
                $gte: fromDate,
                $lt: toDate
              }
            },
        },
        {
            $match: {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            }
        },
        {
            $match: {
            categories: { $in: data.categories }
            }
        },
        {
            $match:{
                privateSiteId:ObjectId(data.privateSiteId)
            }
        },        
        {
          $lookup: {
            from: "virtualID",
            let: {
              pollsterid: "$pollster"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$pollsterid"]
                  }
                }
              },
              {
                $project: {
                  privateSite:1,
                  ownerId: 1,
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  profilePicture: 1
                }
              }
            ],
            as: "admin"
          }
        }, 
        {
          $lookup: {
          from: "user",
          pipeline: [
              {
              $match: {
                  $expr: {
                  $or: [
                    {
                      $eq: ["$_id",   ObjectId(data.siteId)]
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
                  _id: 1
              }
              }
          ],
          as: "adminUser"
          }
      },
        {
            $lookup: {
            from: "user",
            let: {
                pollid: "$pollster",
            },
            
            pipeline: [
                {
                $match: {
                    $expr: {
                    $or: [
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
                    _id: 1
                }
                }
            ],
            as: "pollster"
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
                        $eq: ["$subscriber", ObjectId(data.id)]
                        },
                        {
                        $eq: ["$privateSiteId", ObjectId(data.privateSiteId)]
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
                        $eq: ["$user", ObjectId(data.id)]
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
                        $eq: ["$user_id", ObjectId(data.id)]
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
            siteOwner : {$first:'$admin'},
            admin: {$first:'$adminUser'},
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
            subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
            pollCommentCount:{$first:"$pollCommentCount"},
            subscriptionStatus:{$first:"$subscriptionStatus"},
            verifiedVote: { $first: "$verifiedVote" },
            isOwn:{
                $sum: {
                $cond: [
                    { $eq: ["$pollster._id", ObjectId(data.id)] },
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
            SubscribersList:{$push:"$subscriptionStatusInPrivate"},
            Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
            }
        },
        {
            $match: {
            $or: [
                {
                    isOwn:{
                    $gte:1
                    }
                },
                {
                $and:[
                    {Public: {
                        $gte: 1
                    }},
                {privateSite:{$eq:true}}                  
                    ]
                },
                {
                $and: [
                    {"Subscribers": { $gte:1 } },
                    {privateSite:{$eq:true}},
                    {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
                ]
                },
                {
                $and: [
                    { Specific_Subscribers: { $gte: 1 } },
                    {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                    {privateSite:{$eq:true}}
                ]
                }
            ]
            }
        },
        { $sort: { createdAt: -1 } },
        {$skip :skip},
        {
            $limit:limit
        }
        ], (err, data) =>{
        if (err) {
            res.status(404).json(err);
            
        } else {
            _.map(data, (poll) => {
              if (poll.pollster.length === 0){
                poll.pollster = poll.admin[0]
                poll.pollster.firstName = poll.siteOwner[0].firstName,
                poll.pollster.lastName = poll.siteOwner[0].lastName,
                poll.pollster.profilePicture = poll.siteOwner[0].profilePicture
                poll.pollster.privateSite = true;
              } else {
                poll.pollster = poll.pollster[0]
              }
              delete poll.admin;
              delete poll.siteOwner;
            })
            res.status(200).json(data);
        }
        }
    );

    } else {
      poll.aggregate(
        [
          {
            $match: {
              status: "Open"
            }
          },
          {
            $match :             
              {
                createdAt: {
                  $gte: fromDate,
                  $lt: toDate
                }
              },
          },
          {
            $match: {
              categories: { $in: data.categories }
            }
          },
          {
            $match: {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            }
          },
          {
              $match:{
                  privateSiteId:ObjectId(data.privateSiteId)
              }
          },
      
          {
            $lookup: {
            from: "user",
            pipeline: [
                {
                $match: {
                    $expr: {
                    $or: [
                      {
                        $eq: ["$_id", ObjectId(data.siteId)]
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
                    _id: 1
                }
                }
            ],
            as: "adminUser"
            }
        },    
        {
          $match: {
            country: data.country
          }
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
                  privateSite:1,
                  ownerId: 1,
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  profilePicture: 1
                }
              }
            ],
            as: "admin"
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
                          $eq: ["$subscriber", ObjectId(data.id)]
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
                          $eq: ["$user", ObjectId(data.id)]
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
                          $eq: ["$user_id", ObjectId(data.id)]
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
          {
            $group: {
              _id: "$_id",
              admin: {$first:'$adminUser'},
              siteOwner:{$first:'$admin'},
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
              subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
              pollCommentCount:{$first:"$pollCommentCount"},
              subscriptionStatus:{$first:"$subscriptionStatus"},
              verifiedVote: { $first: "$verifiedVote" },
              isOwn:{
                $sum: {
                  $cond: [
                    { $eq: ["$pollster._id", ObjectId(data.id)] },
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
              userDetails: {$first: "$userDetails"},
              retruthtopic:{$first:"$retruthtopic"},
              pollresult:{$first:"$pollresult"},
              SubscribersList:{$push:"$subscriptionStatusInPrivate"},
              Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
            }
          },
          {
            $match: {
              $or: [
                {
                    isOwn:{
                      $gte:1
                    }
                },
                {
                  $and:[
                      {Public: {
                        $gte: 1
                      }},
                      {privateSite:{$eq:true}}                  
                    ]
                },
                {
                  $and: [
                    {"Subscribers": { $gte:1 } },
                    {privateSite:{$eq:true}},
                    {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
                  ]
                },
                {
                  $and: [
                    { Specific_Subscribers: { $gte: 1 } },
                    {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                    {privateSite:{$eq:true}}
                  ]
                }
              ]
            }
          },
          { $sort: { createdAt: -1 } },
          {$skip: skip},
          {
            $limit: limit
          }
        ],
        (err, data) => {
          if (err) {
            res.json(err);
          } else if (data) {
            _.map(data, (poll) => {
              if (poll.pollster.length === 0){
                  poll.pollster = poll.admin[0]
                  poll.pollster.firstName = poll.siteOwner[0].firstName,
                  poll.pollster.lastName = poll.siteOwner[0].lastName,
                  poll.pollster.profilePicture = poll.siteOwner[0].profilePicture
                  poll.pollster.privateSite = true;
              } else {
                poll.pollster = poll.pollster[0]
              }
              delete poll.admin;
              delete poll.siteOwner;
            })
            res.json(data);
          }
        }
      );
    }
  }
}

privateSitePollController.getAllTopPolls = (req, res, next) => {  
  if(req.query && req.query.data) {
    let data = JSON.parse(req.query.data);
    var skip = data.range
    var userIdArray=[];
    if(data.id){
      userIdArray.push(data.id);
    }
    var limit;
    if(data.limit && data.limit > 0)
      limit = data.limit
    else
     limit = 20;
     var toDate = new Date()
     var fromDate = new Date(toDate);
     fromDate.setDate(toDate.getUTCDate() - 1);
     if(data.toDate) {
       toDate = new Date(data.toDate);
       toDate.setDate(toDate.getDate()+1)
     }
     if(data.fromDate) {
       fromDate = new Date(data.fromDate);
     }
    if(data.location === "world") {
      poll.aggregate(
        [
          {
            $match: {
              status: "Open"
            }
          },
          {
            $match: {
              categories: { $in: data.categories }
            }
          },
          {
            $match: {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            }
          },
          {
              $match:{
                  siteOwnerId:ObjectId(data.siteOwnerId)
              }
          },
          {
            $match: {
              $or: [
                { pollCastCount: { $gte: 1 } },
                { pollCommentCount: { $gte: 1 } },
                { pollRetruthCount: { $gte: 1 } }
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
              from: "virtualID",
              let: {
                pollsterid: "$pollster"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$pollsterid"]
                    }
                  }
                },
                {
                  $project: {
                    privateSite: 1,
                    ownerId: 1,
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    profilePicture: 1
                  }
                }
              ],
              as: "admin"
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
              },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        {
                          $eq: ["$_id", ObjectId(data.siteId)]
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
                    privateSite: 1,
                    email: 1,
                    _id: 1
                  }
                }
              ],
              as: "adminUser"
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
                pollid: "$pollster",
              },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
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
                    privateSite: 1,
                    email: 1,
                    _id: 1
                  }
                }
              ],
              as: "pollster"
            }
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
                          $eq: ["$subscriber", ObjectId(data.id)]
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
                from: "subscription",
                let: {
                  pollid: ObjectId(data.siteOwnerId)
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
                            $eq: ["$subscriber", ObjectId(data.id)]
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
                as: "subscriptionStatusInPrivate"
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
                          $eq: ["$user", ObjectId(data.id)]
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
                          $eq: ["$user_id", ObjectId(data.id)]
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
          {
            $group: {
              _id: "$_id",
              siteOwner: { $first: '$admin' },
              admin: { $first: '$adminUser' },
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
              subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
              pollCommentCount:{$first:"$pollCommentCount"},
              subscriptionStatus:{$first:"$subscriptionStatus"},
              verifiedVote: { $first: "$verifiedVote" },
              isOwn:{
                $sum: {
                  $cond: [
                    { $eq: ["$pollster._id", ObjectId(data.id)] },
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
              userDetails: {$first: "$userDetails"},
              retruthtopic:{$first:"$retruthtopic"},
              pollresult:{$first:"$pollresult"},
              SubscribersList:{$push:"$subscriptionStatusInPrivate"},
              Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
            }
          },
          {
            $addFields: {
              totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
            }
          },
          {
            $match: {
              $or: [
                {
                    isOwn:{
                      $gte:1
                    }
                },
                {
                  $and:[
                      {Public: {
                        $gte: 1
                      }},
                      {privateSite:{$eq:true}}                  
                    ]
                },
                {
                  $and: [
                    {"Subscribers": { $gte:1 } },
                    {privateSite:{$eq:true}},
                    {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
                  ]
                },
                {
                  $and: [
                    { Specific_Subscribers: { $gte: 1 } },
                    {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                    {privateSite:{$eq:true}}
                  ]
                }
              ]
            }
          },
          { $sort: {
              totalCount: -1 
            } 
          },
          {$skip :skip},
          {
            $limit:limit
          }
        ],
        (err, data) => {
          if (err) {
            res.json(err);
          } else {
            _.map(data, (poll) => {
              if (poll.pollster.length === 0) {
                  poll.pollster = poll.admin[0]
                  poll.pollster.firstName = poll.siteOwner[0].firstName,
                  poll.pollster.lastName = poll.siteOwner[0].lastName,
                  poll.pollster.profilePicture = poll.siteOwner[0].profilePicture
                poll.pollster.privateSite = true;
              } else {
                poll.pollster = poll.pollster[0]
              }
              delete poll.admin;
              delete poll.siteOwner;
            })
            res.json(data);
          }
        }
      );
    }  else {
      poll.aggregate(
        [
          {
            $match: {
              status: "Open"
            }
          },
          {
            $match: {
              categories: { $in: data.categories }
            }
          },
          {
            $match: {
              country : data.country
            }
          },
          {
            $match: {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null }}
              ]
            }
          },
          {
              $match:{
                  siteOwnerId:ObjectId(data.siteOwnerId)
              }
          },
          {
            $match: {
              $or: [
                { pollCastCount: { $gte: 1 } },
                { pollCommentCount: { $gte: 1 } },
                { pollRetruthCount: { $gte: 1 } }
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
              from: "virtualID",
              let: {
                pollsterid: "$pollster"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$pollsterid"]
                    }
                  }
                },
                {
                  $project: {
                    privateSite: 1,
                    ownerId: 1,
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    profilePicture: 1
                  }
                }
              ],
              as: "admin"
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
              },
  
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [

                        {
                          $eq: ["$_id", ObjectId(data.siteId)]
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
                    privateSite: 1,
                    email: 1,
                    _id: 1
                  }
                }
              ],
              as: "adminUser"
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
                pollid: "$pollster",
              },
  
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
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
                    privateSite: 1,
                    email: 1,
                    _id: 1
                  }
                }
              ],
              as: "pollster"
            }
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
                          $eq: ["$subscriber", ObjectId(data.id)]
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
                from: "subscription",
                let: {
                  pollid: ObjectId(data.siteOwnerId)
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
                            $eq: ["$subscriber", ObjectId(data.id)]
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
                as: "subscriptionStatusInPrivate"
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
                          $eq: ["$user", ObjectId(data.id)]
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
                          $eq: ["$user_id", ObjectId(data.id)]
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
          {
            $group: {
              _id: "$_id",
              siteOwner: { $first: '$admin' },
              admin: { $first: '$adminUser' },
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
              subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
              pollCommentCount:{$first:"$pollCommentCount"},
              subscriptionStatus:{$first:"$subscriptionStatus"},
              verifiedVote: { $first: "$verifiedVote" },
              isOwn:{
                $sum: {
                  $cond: [
                    { $eq: ["$pollster._id", ObjectId(data.id)] },
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
              userDetails: {$first: "$userDetails"},
              retruthtopic:{$first:"$retruthtopic"},
              pollresult:{$first:"$pollresult"},
              SubscribersList:{$push:"$subscriptionStatusInPrivate"},
              Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
            }
          },
          {
            $addFields: {
              totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
            }
          },
          {
            $match: {
              $or: [
                {
                    isOwn:{
                      $gte:1
                    }
                },
                {
                  $and:[
                      {Public: {
                        $gte: 1
                      }},
                      {privateSite:{$eq:true}}                  
                    ]
                },
                {
                  $and: [
                    {"Subscribers": { $gte:1 } },
                    {privateSite:{$eq:true}},
                    {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
                  ]
                },
                {
                  $and: [
                    { Specific_Subscribers: { $gte: 1 } },
                    {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                    {privateSite:{$eq:true}}
                  ]
                }
              ]
            }
          },
          { $sort: {
              totalCount: -1 
            } 
          },
          {$skip :skip},
          {
            $limit:limit
          }
        ],
        (err, data) => {
          if (err) {
            res.json(err);
          } else {
            _.map(data, (poll) => {
              if (poll.pollster.length === 0) {
                poll.pollster = poll.admin[0]
                poll.pollster.firstName = poll.siteOwner[0].firstName,
                  poll.pollster.lastName = poll.siteOwner[0].lastName,
                  poll.pollster.profilePicture = poll.siteOwner[0].profilePicture
                poll.pollster.privateSite = true;
              } else {
                poll.pollster = poll.pollster[0]
              }
              delete poll.admin;
              delete poll.siteOwner;
            })
            res.json(data);
          }
        }
      );
    }
  } else {
    res.status(500).send({status : failed, message : "server side error"});
  }
} 

privateSitePollController.getAllTrendingPolls = (req, res, next) => {
  let data = {};
  if (req.query.data) {
    data = JSON.parse(req.query.data);
    var skip = data.range
    var userIdArray = [];
    if (data.id) {
      userIdArray.push(data.id);
    }
    var limit;
    if (data.limit && data.limit > 0) {
      limit = data.limit
    }
    else {
      limit = 20;
    }
    var toDate = new Date()
    var fromDate = new Date(toDate);
    fromDate.setDate(toDate.getUTCDate() - 1);
    if (data.toDate) {
      toDate = new Date(data.toDate);
      toDate.setDate(toDate.getDate() + 1)
    }
    if (data.fromDate) {
      fromDate = new Date(data.fromDate);
    }
    if (data.location === "world") {
      poll.aggregate(
        [
          {
            $match: {
              status: "Open"
            }
          },
          {
            $match: {
              createdAt: {
                $gte: fromDate,
                $lte: toDate
              }
            }
          },
          {
            $match: {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null } }
              ]
            }
          },
          {
            $match: {
              categories: { $in: data.categories }
            }
          },
          {
            $match: {
              siteOwnerId: ObjectId(data.siteOwnerId)
            }
          },

          {
            $lookup: {
              from: "virtualID",
              let: {
                pollsterid: "$pollster"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$pollsterid"]
                    }
                  }
                },
                {
                  $project: {
                    privateSite: 1,
                    ownerId: 1,
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    profilePicture: 1
                  }
                }
              ],
              as: "admin"
            }
          },
          {
            $lookup: {
              from: "user",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        {
                          $eq: ["$_id", ObjectId(data.siteId)]
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
                    privateSite: 1,
                    email: 1,
                    _id: 1
                  }
                }
              ],
              as: "adminUser"
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
                pollid: "$pollster",
              },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
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
                    privateSite: 1,
                    email: 1,
                    _id: 1
                  }
                }
              ],
              as: "pollster"
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
                          $eq: ["$subscriber", ObjectId(data.id)]
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
              from: "subscription",
              let: {
                pollid: ObjectId(data.siteOwnerId)
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
                          $eq: ["$subscriber", ObjectId(data.id)]
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
              as: "subscriptionStatusInPrivate"
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
                          $eq: ["$user", ObjectId(data.id)]
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
                          $eq: ["$user_id", ObjectId(data.id)]
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
                    privateSite: 1,
                    email: 1,
                  }
                }
              ],
              as: "userDetails"
            }
          },
          {
            $group: {
              _id: "$_id",
              siteOwner: { $first: '$admin' },
              admin: { $first: '$adminUser' },
              question: { $first: '$question' },
              categories: { $first: "$categories" },
              tags: { $first: "$tags" },
              pollOptions: { $first: "$pollOptions" },
              pollOptionsType: { $first: "$pollOptionsType" },
              articleInfo: { $first: "$articleInfo" },
              status: { $first: "$status" },
              flagPollByUserIds: { $first: "$flagPollByUserIds" },
              createdFor: { $first: "$createdFor" },
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
              expires: { $first: "$expires" },
              privacyOptions: { $first: "$privacyOptions" },
              createdAt: { $first: "$createdAt" },
              retruth_reason: { $first: "$retruth_reason" },
              retruth_by: { $first: "$retruth_by" },
              siteOwnerId: { $first: "$siteOwnerId" },
              disableComments: { $first: "$disableComments" },
              privateSite: { $first: "$privateSite" },
              privateSiteSubsOnly: { $first: "$privateSiteSubsOnly" },
              subscribers: { $first: "$subscribers" },
              subscriptionStatusInPrivate: { $first: "$subscriptionStatusInPrivate" },
              pollCommentCount: { $first: "$pollCommentCount" },
              subscriptionStatus: { $first: "$subscriptionStatus" },
              verifiedVote: { $first: "$verifiedVote" },
              isOwn: {
                $sum: {
                  $cond: [
                    { $eq: ["$pollster._id", ObjectId(data.id)] },
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
              pollster: { $first: "$pollster" },
              userDetails: { $first: "$userDetails" },
              retruthtopic: { $first: "$retruthtopic" },
              pollresult: { $first: "$pollresult" },
              SubscribersList: { $push: "$subscriptionStatusInPrivate" },
              Specific_SubscribersList: { $push: "$privacyOptions.poll" }
            }
          },
          {
            $addFields: {
              totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
            }
          },
          {
            $match: {
              $or: [
                {
                  isOwn: {
                    $gte: 1
                  }
                },
                {
                  $and: [
                    {
                      Public: {
                        $gte: 1
                      }
                    },
                    { privateSite: { $eq: true } }
                  ]
                },
                {
                  $and: [
                    { "Subscribers": { $gte: 1 } },
                    { privateSite: { $eq: true } },
                    { "SubscribersList.0.status": { $eq: "ACCEPTED" } },
                  ]
                },
                {
                  $and: [
                    { Specific_Subscribers: { $gte: 1 } },
                    { "Specific_SubscribersList.subscribers": { $in: userIdArray } },
                    { privateSite: { $eq: true } }
                  ]
                }
              ]
            }
          },
          {
            $sort: {
              totalCount: -1,
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
            _.map(data, (poll) => {
              if (poll.pollster.length === 0) {
                poll.pollster = poll.admin[0]
                poll.pollster.firstName = poll.siteOwner[0].firstName,
                  poll.pollster.lastName = poll.siteOwner[0].lastName,
                  poll.pollster.profilePicture = poll.siteOwner[0].profilePicture
                poll.pollster.privateSite = true;
              } else {
                poll.pollster = poll.pollster[0]
              }
              delete poll.admin;
              delete poll.siteOwner;
            })
            res.json(data);
          }
        }
      );
    }
    else {
      poll.aggregate(
        [
          {
            $match: {
              status: "Open"
            }
          },
          {
            $match: {
              createdAt: {
                $gte: fromDate,
                $lte: toDate
              }
            }
          },
          {
            $match: {
              $or: [
                { expires: { "$gte": new Date() } },
                { expires: { "$eq": null } }
              ]
            }
          },
          {
            $match: {
              country: data.country
            }
          },
          {
            $match: {
              categories: { $in: data.categories }
            }
          },
          {
            $match: {
              siteOwnerId: ObjectId(data.siteOwnerId)
            }
          },

          {
            $lookup: {
              from: "virtualID",
              let: {
                pollsterid: "$pollster"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$pollsterid"]
                    }
                  }
                },
                {
                  $project: {
                    privateSite: 1,
                    ownerId: 1,
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    profilePicture: 1
                  }
                }
              ],
              as: "admin"
            }
          },
          {
            $lookup: {
              from: "user",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        {
                          $eq: ["$_id", ObjectId(data.siteId)]
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
                    privateSite: 1,
                    email: 1,
                    _id: 1
                  }
                }
              ],
              as: "adminUser"
            }
          },
          {
            $lookup: {
              from: "user",
              let: {
                pollid: "$pollster",
              },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
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
                    privateSite: 1,
                    email: 1,
                    _id: 1
                  }
                }
              ],
              as: "pollster"
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
                          $eq: ["$subscriber", ObjectId(data.id)]
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
              from: "subscription",
              let: {
                pollid: ObjectId(data.siteOwnerId)
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
                          $eq: ["$subscriber", ObjectId(data.id)]
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
              as: "subscriptionStatusInPrivate"
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
                          $eq: ["$user", ObjectId(data.id)]
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
                          $eq: ["$user_id", ObjectId(data.id)]
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
                    privateSite: 1,
                    email: 1,
                  }
                }
              ],
              as: "userDetails"
            }
          },
          {
            $group: {
              _id: "$_id",
              siteOwner: { $first: '$admin' },
              admin: { $first: '$adminUser' },
              question: { $first: '$question' },
              categories: { $first: "$categories" },
              tags: { $first: "$tags" },
              pollOptions: { $first: "$pollOptions" },
              pollOptionsType: { $first: "$pollOptionsType" },
              articleInfo: { $first: "$articleInfo" },
              status: { $first: "$status" },
              flagPollByUserIds: { $first: "$flagPollByUserIds" },
              createdFor: { $first: "$createdFor" },
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
              expires: { $first: "$expires" },
              privacyOptions: { $first: "$privacyOptions" },
              createdAt: { $first: "$createdAt" },
              retruth_reason: { $first: "$retruth_reason" },
              retruth_by: { $first: "$retruth_by" },
              siteOwnerId: { $first: "$siteOwnerId" },
              disableComments: { $first: "$disableComments" },
              privateSite: { $first: "$privateSite" },
              privateSiteSubsOnly: { $first: "$privateSiteSubsOnly" },
              subscribers: { $first: "$subscribers" },
              subscriptionStatusInPrivate: { $first: "$subscriptionStatusInPrivate" },
              pollCommentCount: { $first: "$pollCommentCount" },
              subscriptionStatus: { $first: "$subscriptionStatus" },
              verifiedVote: { $first: "$verifiedVote" },
              isOwn: {
                $sum: {
                  $cond: [
                    { $eq: ["$pollster._id", ObjectId(data.id)] },
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
              pollster: { $first: "$pollster" },
              userDetails: { $first: "$userDetails" },
              retruthtopic: { $first: "$retruthtopic" },
              pollresult: { $first: "$pollresult" },
              SubscribersList: { $push: "$subscriptionStatusInPrivate" },
              Specific_SubscribersList: { $push: "$privacyOptions.poll" }
            }
          },
          {
            $addFields: {
              totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
            }
          },
          {
            $match: {
              $or: [
                {
                  isOwn: {
                    $gte: 1
                  }
                },
                {
                  $and: [
                    {
                      Public: {
                        $gte: 1
                      }
                    },
                    { privateSite: { $eq: true } }
                  ]
                },
                {
                  $and: [
                    { "Subscribers": { $gte: 1 } },
                    { privateSite: { $eq: true } },
                    { "SubscribersList.0.status": { $eq: "ACCEPTED" } },
                  ]
                },
                {
                  $and: [
                    { Specific_Subscribers: { $gte: 1 } },
                    { "Specific_SubscribersList.subscribers": { $in: userIdArray } },
                    { privateSite: { $eq: true } }
                  ]
                }
              ]
            }
          },
          {
            $sort: {
              totalCount: -1,
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
            _.map(data, (poll) => {
              if (poll.pollster.length === 0) {
                poll.pollster = poll.admin[0]
                poll.pollster.firstName = poll.siteOwner[0].firstName,
                  poll.pollster.lastName = poll.siteOwner[0].lastName,
                  poll.pollster.profilePicture = poll.siteOwner[0].profilePicture
                poll.pollster.privateSite = true;
              } else {
                poll.pollster = poll.pollster[0]
              }
              delete poll.admin;
              delete poll.siteOwner;
            })
            res.json(data);
          }
        }
      );
    }
  } else {
    res.status(500).json("server side error");
  }

}

privateSitePollController.getrecentpollsbyworld = (req, res, next) => {
  let skip = req.body.range;
  var userIdArray=[];
  if(req.body.id){
    userIdArray.push(req.body.id);
  }
  var limit = 10;
  if(req.body.limit && req.body.limit > 0) {
    limit=req.body.limit
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
          categories: { $in: req.body.categories }
        }
      },
      {
        $match: {
          $or: [
            { expires: { "$gte": new Date() } },
            { expires: { "$eq": null }}
          ]
        }
      },
      {
          $match:{
              siteOwnerId:ObjectId(req.body.siteOwnerId)
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
                privateSite:1,
                ownerId: 1,
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
            from: "subscription",
            let: {
              pollid: ObjectId(req.body.siteOwnerId)
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
            as: "subscriptionStatusInPrivate"
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
          subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
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
          userDetails: {$first: "$userDetails"},
          retruthtopic:{$first:"$retruthtopic"},
          pollresult:{$first:"$pollresult"},
          SubscribersList:{$push:"$subscriptionStatusInPrivate"},
          Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
        }
      },
      {
        $match: {
          $or: [
            {
                isOwn:{
                  $gte:1
                }
            },
            {
              $and:[
                  {Public: {
                    $gte: 1
                  }},
                  {privateSite:{$eq:true}}                  
                ]
            },
            {
              $and: [
                {"Subscribers": { $gte:1 } },
                {privateSite:{$eq:true}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { Specific_Subscribers: { $gte: 1 } },
                {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                {privateSite:{$eq:true}}
              ]
            }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {$skip :skip},
      {
        $limit:limit
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

privateSitePollController.getsubscriberrecentpolls = (req, res, next) => {
    var number = req.body.range;
    var skip = (number - 1) * 20;
    var userIdArray=[];
    if(req.body.id){
      userIdArray.push(req.body.id);
    }
    var limit = 10;
    if(req.body.limit && req.body.limit > 0)
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
            categories: { $in: req.body.categories }
          }
        },
        {
          $match: {
            $or: [
              { expires: { "$gte": new Date() } },
              { expires: { "$eq": null }}
            ]
          }
        },
        {
            $match:{
                siteOwnerId:ObjectId(req.body.siteOwnerId)
            }
        },
  
        {
          $match: {
            country: req.body.country
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
              from: "subscription",
              let: {
                pollid: ObjectId(req.body.userId)
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
              as: "subscriptionStatusInPrivate"
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
            subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
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
            SubscribersList:{$push:"$subscriptionStatusInPrivate"},
            Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
          }
        },
        {
          $match: {
            $or: [
              {
                  isOwn:{
                    $gte:1
                  }
              },
              // {
              //   siteOwnerId:ObjectId(req.body.siteOwnerId)
              //   // $and:[
              //   //   {
              //   //     privateSite:{$eq:true}
              //   //   },
              //     // {siteOwnerId:ObjectId(req.body.siteOwnerId)}
              //   // ]
              // },
              {
                $and:[
                    {Public: {
                      $gte: 1
                    }},
                    {privateSite:{$eq:true}}                  
                  ]
              },
              {
                $and: [
                  {"Subscribers": { $gte:1 } },
                  {privateSite:{$eq:true}},
                  {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
                ]
              },
              {
                $and: [
                  { Specific_Subscribers: { $gte: 1 } },
                  {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                  {privateSite:{$eq:true}}
                ]
              }
            ]
          }
        },
        { $sort: { 
          createdAt: -1,
          _id: 1 
         } },
        {$skip :skip},
        {
          $limit:limit
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

privateSitePollController.gettoppolls = (req, res, next) => {
    var number = req.body.range;
    var skip = (number - 1) * 20;
    var userIdArray=[];
    if(req.body.id){
      userIdArray.push(req.body.id);
    }
    var limit;
    if(req.body.limit && req.body.limit > 0)
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
            categories: { $in: req.body.categories }
          }
        },
        {
          $match: {
            $or: [
              { expires: { "$gte": new Date() } },
              { expires: { "$eq": null }}
            ]
          }
        },
        {
            $match:{
                siteOwnerId:ObjectId(req.body.siteOwnerId)
            }
        },
        {
          $match: {
            $or: [
              { pollCastCount: { $gte: 1 } },
              { pollCommentCount: { $gte: 1 } },
              { pollRetruthCount: { $gte: 1 } }
            ]
          }
        },
        { $sort: { pollCastCount: 1 } },
        {
          $match: {
            country: req.body.country
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
                  ownerId:1,
                  privateSite:1,
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
              from: "subscription",
              let: {
                pollid: ObjectId(req.body.siteOwnerId)
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
              as: "subscriptionStatusInPrivate"
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
            subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
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
            userDetails: {$first: "$userDetails"},
            retruthtopic:{$first:"$retruthtopic"},
            pollresult:{$first:"$pollresult"},
            SubscribersList:{$push:"$subscriptionStatusInPrivate"},
            Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
          }
        },
        {
          $addFields: {
            totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
          }
        },
        {
          $match: {
            $or: [
              {
                  isOwn:{
                    $gte:1
                  }
              },
              {
                $and:[
                    {Public: {
                      $gte: 1
                    }},
                    {privateSite:{$eq:true}}                  
                  ]
              },
              {
                $and: [
                  {"Subscribers": { $gte:1 } },
                  {privateSite:{$eq:true}},
                  {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
                ]
              },
              {
                $and: [
                  { Specific_Subscribers: { $gte: 1 } },
                  {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                  {privateSite:{$eq:true}}
                ]
              }
            ]
          }
        },
        { $sort: {
            totalCount: -1 
          } 
        },
        // {$skip :skip},
        // {
        //   $limit:limit
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

privateSitePollController.gettoppollsbyworld = (req, res, next) => {
  var number = req.body.range;
  var skip = (number - 1) * 20;
  var userIdArray=[];
  if(req.body.id){
    userIdArray.push(req.body.id);
  }
  var limit;
  if(req.body.limit && req.body.limit > 0)
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
          categories: { $in: req.body.categories }
        }
      },
      {
        $match: {
          $or: [
            { expires: { "$gte": new Date() } },
            { expires: { "$eq": null }}
          ]
        }
      },
      {
          $match:{
              siteOwnerId:ObjectId(req.body.siteOwnerId)
          }
      },
      {
        $match: {
          $or: [
            { pollCastCount: { $gte: 1 } },
            { pollCommentCount: { $gte: 1 } },
            { pollRetruthCount: { $gte: 1 } }
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
                ownerId:1,
                privateSite:1,
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
            from: "subscription",
            let: {
              pollid: ObjectId(req.body.siteOwnerId)
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
            as: "subscriptionStatusInPrivate"
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
          subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
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
          userDetails: {$first: "$userDetails"},
          retruthtopic:{$first:"$retruthtopic"},
          pollresult:{$first:"$pollresult"},
          SubscribersList:{$push:"$subscriptionStatusInPrivate"},
          Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
        }
      },
      {
        $addFields: {
          totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
        }
      },
      {
        $match: {
          $or: [
            {
                isOwn:{
                  $gte:1
                }
            },
            {
              $and:[
                  {Public: {
                    $gte: 1
                  }},
                  {privateSite:{$eq:true}}                  
                ]
            },
            {
              $and: [
                {"Subscribers": { $gte:1 } },
                {privateSite:{$eq:true}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { Specific_Subscribers: { $gte: 1 } },
                {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                {privateSite:{$eq:true}}
              ]
            }
          ]
        }
      },
      { $sort: {
          totalCount: -1 
        } 
      },
      // {$skip :skip},
      // {
      //   $limit:limit
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

privateSitePollController.gettrendingpolls = (req, res, next) => {
    var number = req.body.range;
    var skip = (number - 1) * 20;
    var userIdArray=[];
    var dateNow = new Date();
    var dateAgo = new Date(dateNow);
    dateAgo.setDate(dateNow.getUTCDate() - 1);
    if(req.body.id){
      userIdArray.push(req.body.id);
    }
    var limit;
    if(req.body.limit && req.body.limit > 0)
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
              createdAt: {
                $gte: dateAgo,
                $lte: dateNow
              }
            }
          },
        {
          $match: {
            categories: { $in: req.body.categories }
          }
        },
        {
          $match: {
            $or: [
              { expires: { "$gte": new Date() } },
              { expires: { "$eq": null }}
            ]
          }
        },
        {
            $match:{
                siteOwnerId:ObjectId(req.body.siteOwnerId)
            }
        },

        {
          $match: {
            country: req.body.country
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
                  ownerId:1,
                  privateSite:1,
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
              from: "subscription",
              let: {
                pollid: ObjectId(req.body.siteOwnerId)
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
              as: "subscriptionStatusInPrivate"
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
            subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
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
            userDetails: {$first: "$userDetails"},
            retruthtopic:{$first:"$retruthtopic"},
            pollresult:{$first:"$pollresult"},
            SubscribersList:{$push:"$subscriptionStatusInPrivate"},
            Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
          }
        },
        {
          $addFields: {
            totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
          }
        },
        {
          $match: {
            $or: [
              {
                  isOwn:{
                    $gte:1
                  }
              },
              {
                $and:[
                    {Public: {
                      $gte: 1
                    }},
                    {privateSite:{$eq:true}}                  
                  ]
              },
              {
                $and: [
                  {"Subscribers": { $gte:1 } },
                  {privateSite:{$eq:true}},
                  {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
                ]
              },
              {
                $and: [
                  { Specific_Subscribers: { $gte: 1 } },
                  {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                  {privateSite:{$eq:true}}
                ]
              }
            ]
          }
        },
        { $sort: {
            totalCount: -1 
          } 
        },
        // {$skip :skip},
        // {
        //   $limit:limit
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

privateSitePollController.gettrendingpollsbyworld = (req, res, next) => {
    var number = req.body.range;
  var skip = (number - 1) * 20;
  var userIdArray=[];
  var dateNow = new Date();
  var dateAgo = new Date(dateNow);
  dateAgo.setDate(dateNow.getUTCDate() - 1);
  if(req.body.id){
    userIdArray.push(req.body.id);
  }
  var limit;
  if(req.body.limit && req.body.limit > 0)
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
          createdAt: {
            $gte: dateAgo,
            $lte: dateNow
          }
        }
      },
      {
        $match: {
          $or: [
            { expires: { "$gte": new Date() } },
            { expires: { "$eq": null }}
          ]
        }
      },
      {
        $match: {
          categories: { $in: req.body.categories }
        }
      },
      {
          $match:{
              siteOwnerId:ObjectId(req.body.siteOwnerId)
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
                ownerId:1,
                privateSite:1,
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
          $lookup: {
            from: "subscription",
            let: {
              pollid: ObjectId(req.body.siteOwnerId)
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
            as: "subscriptionStatusInPrivate"
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
          subscriptionStatusInPrivate:{$first:"$subscriptionStatusInPrivate"},
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
          userDetails: {$first: "$userDetails"},
          retruthtopic:{$first:"$retruthtopic"},
          pollresult:{$first:"$pollresult"},
          SubscribersList:{$push:"$subscriptionStatusInPrivate"},
          Specific_SubscribersList:{$push	:"$privacyOptions.poll"}
        }
      },
      {
        $addFields: {
          totalCount: { $add: ["$pollRetruthCount", "$pollCastCount", "$pollCommentCount"] }
        }
      },
      {
        $match: {
          $or: [
            {
                isOwn:{
                  $gte:1
                }
            },
            {
              $and:[
                  {Public: {
                    $gte: 1
                  }},
                  {privateSite:{$eq:true}}                  
                ]
            },
            {
              $and: [
                {"Subscribers": { $gte:1 } },
                {privateSite:{$eq:true}},
                {"SubscribersList.0.status": {  $eq: "ACCEPTED"} },
              ]
            },
            {
              $and: [
                { Specific_Subscribers: { $gte: 1 } },
                {"Specific_SubscribersList.subscribers":{$in:userIdArray}},
                {privateSite:{$eq:true}}
              ]
            }
          ]
        }
      },
      { $sort: {
        totalCount: -1 
      } 
    },
      // {$skip :skip},
      // {
      //   $limit:limit
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

privateSitePollController.gettopcount = (req, res, next) => {
    poll.countDocuments({categories: { $in: req.body.categories },status:"Open",privateSite:true,siteOwnerId:ObjectId(req.body.id),country:req.body.country,pollCastCount: { $gte: 1 }}).exec((err, data) => {
      if(err) {
        res.status(err);
        return;
      }  
      res.json(data)
    });
};

privateSitePollController.gettrendingcount = (req, res, next) => {
    var dateNow = new Date();
    var dateAgo = new Date(dateNow);
    dateAgo.setDate(dateNow.getUTCDate() - 1);
    poll.countDocuments({categories: { $in: req.body.categories },createdAt: { $gte: dateAgo,$lte:dateNow },status:"Open",privateSite:true,siteOwnerId:ObjectId(req.body.id),country:req.body.country}).exec((err, data) => {
      if(err) {
        res.status(err);
        return;
      }  
      res.json(data)
    });
};

privateSitePollController.getrecentcount = (req, res, next) => {
    poll.countDocuments({categories: { $in: req.body.categories },status:"Open",privateSite:true,siteOwnerId:ObjectId(req.body.id),country:req.body.country}).exec((err, data) => {
      if(err) {
        res.status(err);
        return;
      }  
      res.json(data)
    });
};

privateSitePollController.getpollinfo = (req, res, next) => {
    poll.find({privateSite:true,status:"Open", privateSiteId: ObjectId(req.params.id)}).exec((err,data)=>{
      if(err) {
        res.status(err);
        return;
      }
      res.json(data);
    });
};

privateSitePollController.gettopcountworld = (req, res, next) => {
    poll.countDocuments({status:"Open",categories: { $in: req.body.categories },privateSite:true,siteOwnerId:ObjectId(req.body.id),pollCastCount: { $gte: 1 }}).exec((err, data) => {
      if(err) {
        res.status(err);
        return;
      }
      res.json(data)
    });
};

privateSitePollController.gettrendingcountworld = (req, res, next) => {
    var dateNow = new Date();
    var dateAgo = new Date(dateNow);
    dateAgo.setDate(dateNow.getUTCDate() - 1);
    poll.countDocuments({categories: { $in: req.body.categories },createdAt: { $gte: dateAgo,$lte:dateNow },status:"Open",privateSite:true,siteOwnerId:ObjectId(req.body.id)}).exec((err, data) => {
      if(err) {
        res.status(err);
        return;
      }
      res.json(data)
    });
};

privateSitePollController.getrecentcountworld = (req, res, next) => {
    poll.countDocuments({categories: { $in: req.body.categories },status:"Open",privateSite:true,siteOwnerId:ObjectId(req.body.id)}).exec((err, data) => {
      if(err) {
        res.status(err);
        return;
      }
      res.json(data)
    });
};

module.exports = privateSitePollController;