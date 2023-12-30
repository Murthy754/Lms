var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var pollresult = new Schema({
  poll: {
    type: Schema.Types.ObjectId,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    index: true
  },
  result: {
    type: String
  },
  country: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
});

pollresult.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
  if(this.getUpdate()) {
    this.getUpdate().updatedAt = Date.now();
    return next();
} 
next();
})
module.exports = mongoose.model("pollresult", pollresult, "pollresult");
