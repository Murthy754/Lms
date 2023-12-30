var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var commentreplies = new Schema({
    poll: {
        type: Schema.Types.ObjectId
    },
    comment: {
        type: Schema.Types.ObjectId,
        required: true
    },
    thread: {
        type: Schema.Types.ObjectId,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true
    },
    files: {
        type: Array,
        default: []
    },
    replycomment: {
        type: String
    },
    replytype: {
        type: String
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});
commentreplies.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })
module.exports = mongoose.model(
    "commentreplies",
    commentreplies,
    "commentreplies"
);