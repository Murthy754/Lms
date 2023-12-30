const { ObjectId } = require("mongodb");
var notification = require('../models/notifications');

notificationController = () => { };

notificationController.getsubscribernotifications = (req, res, next) => {
    notification.aggregate(
        [{
            $match: {
                notifyTo: ObjectId(req.body.notifyTo)
            }
        },
        {
            $match: {
                privateSiteId: ObjectId(req.body.privateSiteId)
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "user",
                let: {
                    createdBy: "$createdBy"
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$_id", "$$createdBy"]
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
                as: "createdBy"
            }
        },
        {
            $unwind: "$createdBy"
        }
        ], (err, data) => {
            if (err) {
                res.json(err);
            } else {
                res.status(200).json(data);
            }
        }
    );
};

notificationController.getallnotifications = (req, res, next) => {
    notification.aggregate(
        [{
            $match: {
                notifyTo: ObjectId(req.body.notifyTo)
            },
        },
        {
            $match: {
                privateSiteId: null
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "user",
                let: {
                    createdBy: "$createdBy"
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$_id", "$$createdBy"]
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
                as: "createdBy"
            }
        },
        {
            $unwind: "$createdBy"
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

notificationController.saveGroupNotifcation = (req, res, next) => {
    var notifications = req.body;
    notification.insertMany(notifications, (err, data) => {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    }); 
};

notificationController.getallprivatenotifications = (req, res, next) => {
    notification.aggregate(
        [{
            $match: {
                notifyTo: ObjectId(req.body.notifyTo)
            },
        },
        {
            $match: {
                privateSiteId: ObjectId(req.body.privateSiteId)
            }
        },
        {
            $match: {
                privateSite: true
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "user",
                let: {
                    createdBy: "$createdBy"
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$_id", "$$createdBy"]
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
                as: "createdBy"
            }
        },
        {
            $unwind: "$createdBy"
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

notificationController.markasviewd = (req, res, next) => {
    notification.findByIdAndUpdate(
        ObjectId(req.body.id), {
            $set: {
                isRead: true,
                isViewed: true
            }
        }, {
            new: true
        },
        (err, notification) => {
            if(err) {
                res.json(err);
                return;
            }
            res.send(notification);
        }
    );
};

notificationController.savenotifcation = (req, res, next) => {
    var notifications = new notification(req.body)
    notifications.save((err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
};

notificationController.markasallviewd = (req, res, next) => {
    notification.updateMany({ notifyTo: ObjectId(req.body.notifyTo) }, { $set: { isViewed: true } })
    .exec((err, data) => {
        if (err) {
            res.send({
                success: false,
                message: "Server side error occcurred",
                error: err
              });
        }
        res.send(data);
    });
};

notificationController.markasallread = (req, res, next) => {
    notification.updateMany({ notifyTo: ObjectId(req.body.notifyTo) }, { $set: { isRead: true, isViewed: true } })
    .exec((err, data) => {
        if (err) {
            res.json({
                success: false,
                message: "Server side error occcurred",
                error : err
              });
              return;
        }
        res.send(data);
    });
};

module.exports = notificationController;