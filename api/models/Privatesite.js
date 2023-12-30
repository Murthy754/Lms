var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var privateSite = new Schema({
    ownerId: {                              // User ID of user who is creating the private site
        type: Schema.Types.ObjectId,
        required: true
    },
    virtualUser: {                         // Virtual User ID of the owner
        type: Schema.Types.ObjectId,
        required: true
    },
    settings: {                            // Private site settings
        type: Schema.Types.Mixed,
        default: {}
    },
    privateSite: {                        // Private site Boolean value 
        type: Boolean,
        default: true
    },
    messagePermission: {                 // Message Permission always true
        type: Boolean,
        default: true
    },
    allowAutomaticSubscription: {        // Boolean value for allow automatic subscriptions
        type: Boolean,
        default: true
    },
    admins: {                           // Private site admins Array
        type: Array
    },
    privateTopicsPublicView: {          // Private site public topic view setting
        type: Boolean,
        default: true
    },
    isActive: {                         // Private site status
        type: Boolean,
        default: true
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
privateSite.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })
module.exports = mongoose.model("privateSite", privateSite, "privateSite");