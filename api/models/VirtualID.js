var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var virtualID = new Schema({
    ownerId: {                          // ID of the user
        type: Schema.Types.ObjectId
    },
    privateSiteSettings: {              // Private site settings model ID
        type: Schema.Types.ObjectId
    },
    privateSite: {                     // Private Site Boolean value
        type: Boolean,
        default: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    profilePicture: {
        type: String
    },
    address: {
        type: JSON,
        default: {}
    },
    userName: {
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
virtualID.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })
module.exports = mongoose.model("virtualID", virtualID, "virtualID");