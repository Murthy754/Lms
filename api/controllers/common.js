const { ObjectId } = require("mongodb");
const user = require('../models/User');
const privateSite = require("../models/Privatesite");
const Subscription = require("../models/Subscription");
var poll = require("../models/Poll");
const _ = require("lodash");


commonController = () => { };

commonController.search = (req, res, next) => {
    if (req.query.privateSiteId) {
        privateSiteId = ObjectId(req.query.privateSiteId);
        if (req.query.searchType === "profile") {
            Subscription.aggregate(
                [
                    {
                        $match: {
                            privateSiteId: privateSiteId
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
                        let subscribers = _.map(data,(value) => {
                            return value['subscriber']
                        })
                        subscribers = _.uniqBy(subscribers, 'userName');
                        res.json(subscribers);
                    }
                }
            );
        } else if (req.query.searchType === "poll") {
            poll.aggregate(
                [
                    {
                        $match: {
                            $and: [
                                { status: "Open" },
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
        }
    } else {
        if (req.query.searchType === "profile") {
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
                        _id: 1,
                        address: 1,
                        email: 1,
                        userName: 1,
                        privateSite: 1,
                        privateSiteSettings: 1
                    }
                )
                .exec(function (err, data) {
                    if (!err) {
                        res.json(data);
                    } else {
                        res.send({ result: false, error: err});
                    }
                });
        } else if (req.query.searchType === "privateSite") {
            privateSite
                .find()
                .exec(function (err, data) {
                    if (!err) {
                        res.json(data);
                    } else {
                        res.json({ success: false, error: err})
                    }
                });
        } else if (req.query.searchType === "poll") {
            poll.aggregate(
                [
                    {
                        $match: {
                            $and: [
                                { status: "Open" },
                                { privateSiteId: null }
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
        }
    }
}

module.exports = commonController;