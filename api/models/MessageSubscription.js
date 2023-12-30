var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var subscription = new Schema({
  status: {
    type: String,
    enum: ["CANCELLED", "PENDING", "ACCEPTED", "UNSUBSCRIBE"],
    required: true
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    index: true
  },
  requestedTo: {
    type: Schema.Types.ObjectId,
    index: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedBy: {
    type: Schema.Types.ObjectId,
    default: null
  },
  privateSiteId: {
    type: Schema.Types.ObjectId,
    default: null
  },
  createdAt:{
    type:Date,
    default: Date.now()
  },
  updatedAt:{
    type:Date,
    default: Date.now()
  }
});
subscription.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
  if(this.getUpdate()) {
    this.getUpdate().updatedAt = Date.now();
    return next();
} 
next();
})
module.exports = mongoose.model("messagesubscription", subscription, "messagesubscription");
