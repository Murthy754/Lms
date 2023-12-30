var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var retruthtopics = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    index: true
  },
  poll_id: {
    type: Schema.Types.ObjectId,
    index: true
  },
  retruth_reason: {
    type: String
  },
  createdAt: {
    type:Date,
    default: Date.now()
  },
  updatedAt: {
    type:Date,
    default: Date.now()
  }
});
retruthtopics.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
  if(this.getUpdate()) {
    this.getUpdate().updatedAt = Date.now();
    return next();
} 
next();
})
module.exports = mongoose.model(
  "retruthtopics",
  retruthtopics,
  "retruthtopics"
);
