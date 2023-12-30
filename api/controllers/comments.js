const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const comments = require("../models/comment");
const commentreplies = require("../models/commentreplies");
const poll = require("../models/Poll");

commentsController = () => { };

commentsController.postcomment = (req, res, next) => {
    const comment = new comments(req.body);
    comment.save((err, data) => {
      if(err) {
        res.json({ result: false, error: err})
      } else {
        res.json(data);
      }
    });
};

commentsController.postcommentreply = (req, res, next) => {
    const commentreply = new commentreplies(req.body);
    commentreply.save((err, data) => {
      if (err) {
        res.json({ result: false, error: err})
      }else {
        res.json(data);
      }
    });
};

commentsController.getcomments = (req, res, next) => {
    comments.aggregate(
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
};

commentsController.getprivatecomments = (req, res, next) => {
    comments.aggregate(
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
};

commentsController.getcommentrepliesthread = (req, res, next) => {
    commentreplies.aggregate(
        [
          {
            $match: {
              comment: ObjectId(req.body.commentid)
            }
          },
          {
            $match: {
              thread: ObjectId(req.body.thread)
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "user",
              let: {
                pollid: "$user"
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
};

commentsController.getcommentsreply = (req, res, next) => {
    commentreplies.aggregate(
        [
          {
            $match: {
              comment: ObjectId(req.body.commentid)
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "user",
              let: {
                pollid: "$user"
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
};

commentsController.incremntcommentcount = (req, res, next) => {
    poll
    .update(
      { _id: req.body.pollid },
      {
        $inc: { pollCommentCount: 1 }
      }
    )
    .exec((err, data) => {
      if(err) {
        res.send({ result: false, error: err});
      } else {
        res.send(data);
      }
    });
};

commentsController.incremntreplycommentcount = (req, res, next) => {
    comments
    .update(
      { _id: ObjectId(req.body.commentid) },
      {
        $inc: { replyCount: 1 }
      }
    )
    .exec((err, data) => {
      if (err) {
        res.send({ result: false, error: err})
      } else {
      res.send(data);
      }
    });
};

commentsController.decremntcommentcount = (req, res, next) => {
    poll
      .update(
        { _id: ObjectId(req.body.pollid) },
        {
          $inc: { pollCommentCount: -1 }
        }
      )
      .exec((err, data) => {
        if (err) {
          res.send({ result: false, error: err})
        } else {
          res.send(data);
        }
      });
};

commentsController.decremntreplycommentcount = (req, res, next) => {
    comments
      .update(
        { _id: ObjectId(req.body.commentid) },
        {
          $inc: { replyCount: -1 }
        }
      )
      .exec((err, data) => {
        if (err) {
          res.send({ result: false, error: err})
        }else{
          res.send(data)
        }
      });
};

commentsController.deletecomment = (req, res, next) => {
    comments
    .remove({ _id: ObjectId(req.params.id) })
    .exec((err, data) => {
      if (err) {
        res.send({ result: false, error: err})
      } else {
        res.send(data);
      }
      
    });
};

commentsController.deletereplycomment = (req, res, next) => {
    commentreplies
    .remove({ _id: ObjectId(req.params.id) })
    .exec((err, data) => {
      if (err) {
        res.send({ result: false, error: err})
      } else {
        res.send(data);
      }
    });
};

module.exports = commentsController;