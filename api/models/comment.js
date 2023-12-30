var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var comment = new Schema({
    poll: {
        type: Schema.Types.ObjectId
    },
    user: {
        type: Schema.Types.ObjectId,
        index: true
    },
    comment: String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updateddAt: {
        type: Date,
        default: Date.now()
    },
    files: {
        type: Array,
        default: []
    },
    replyCount: {
        type: Number,
        default: 0
    }
});
comment.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })
module.exports = mongoose.model("comment", comment, "comment");