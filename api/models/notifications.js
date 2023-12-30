var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Poll = require('./Poll');
var User = require('./User');
var notification = new Schema({
    type: {
        type: String,
        enum: ['COMMENT', 'BROADCAST', 'YOUTUBE', 'POLL_FOLLOWER', 'BROADCAST_REPLY', 'SUBSCRIBE', 'COMMENT_REPLY','MESSAGE','MESSAGE_REQUEST', 'ADMIN', 'FILE_SHARING'],
        required: true
    },
    message: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isViewed: {
        type: Boolean,
        default: false
    },
    notifyTo: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    privateSite:{
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    pollId: {
        type: Schema.Types.ObjectId,
        ref: Poll

    },
    subscribeId: {
        type: Schema.Types.ObjectId,
        // ref: 'Subscription'
    },
    commentId: {
        type: Schema.Types.ObjectId,
        // ref: 'comment'
    },
    broadcastId: {
        type: Schema.Types.ObjectId,
        // ref:'broadcast'
    },
    broadcastRepliesId: {
        type: Schema.Types.ObjectId,
        // ref:'broadcastReplies'
    },
    createdAt:{
        type:Date,
        default: Date.now()
      },
      updatedAt:{
        type:Date,
        default: Date.now()
      },
    privateSiteId: {
        type: Schema.Types.ObjectId,
        default: null
    }
});
notification.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })
module.exports = mongoose.model(
    "notification",
    notification,
    "notification"
);