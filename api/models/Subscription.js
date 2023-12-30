var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var subscription = new Schema({
  status: {                       // Subscription status
    type: String,
    enum: ["CANCELLED", "PENDING", "ACCEPTED", "UNSUBSCRIBE"],
    required: true
  },
  feedoption: {                  // Feed option for profile feed
    type: String
  },
  subscribee: {                 // User who is subscribed to main user
    type: Schema.Types.ObjectId,
    index: true
  },
  subscriber: {                // Main user
    type: Schema.Types.ObjectId,
    index: true
  },
  privateSiteId: {              // Private site ID
    type: Schema.Types.ObjectId,
    default: null,
    index: true
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
subscription.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
  if(this.getUpdate()) {
    this.getUpdate().updatedAt = Date.now();
    return next();
} 
next();
})
module.exports = mongoose.model("subscription", subscription, "subscription");
