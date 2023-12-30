var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require('./User');
var Groups = require('./Groups');

var message = new Schema({
  message: {
    type: String
  },
  files: {
    type: Array,
    default: []
  },
  sendTo: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true
  },
  replyFor: {
    type: Schema.Types.ObjectId
    // required: false
  },
  likeCount: {
    type: Number
  },
  disLikeCount: {
    type: Number
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: Groups,
    required: false
  },
  createdAt:{
    type:Date,
    default: Date.now()
  },
  updatedAt:{
    type:Date,
    default: Date.now()
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  likedBy: {
    type: Array,
    default: []
  },
  forwardedBy: {
    type: Schema.Types.ObjectId,
    ref: User
  },
  privateSiteId: {
    type: Schema.Types.ObjectId,
    default: null
  }
});
message.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
  if(this.getUpdate()) {
    this.getUpdate().updatedAt = Date.now();
    return next();
} 
next();
})
module.exports = mongoose.model(
  "message",
  message,
  "message"
);
