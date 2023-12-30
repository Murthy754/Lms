const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FilePermissions = new Schema({
    privateSiteId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    blocked: {
        type: Schema.Types.Mixed,
        default: []
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

FilePermissions.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
  if(this.getUpdate()) {
    this.getUpdate().updatedAt = Date.now();
    return next();
} 
next();
})
module.exports = mongoose.model('filePermissions', FilePermissions, 'filePermissions');