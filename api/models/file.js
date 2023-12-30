const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const folder = require('./folder');
const User = require('./User');

const file = new Schema({
    fileName: {             // File name
        type: String
    },
    metaData: {             // Meta data related to the file
        type: Schema.Types.Mixed,
        default: {}
    },
    parentFolder: {               // Reference to folder object
        type: Schema.Types.ObjectId,
        ref: folder
    },
    url: {                  // File url
        type: String,
    },
    createdBy: {            // Created by reference to user object
        type: Schema.Types.ObjectId,
        ref: User
    },
    createdAt: {            // Created at time
        type: Date,
        default: Date.now()
    },
    updatedAt: {            // File update time
        type: Date,     
        default: Date.now()
    },
    isDeleted: {            // Deleted or not 
        type: Boolean,
        default: false
    },
    privateSiteId: {        // Privatesite ID
        type: Schema.Types.ObjectId,
        default: null
    },
    sentToUsers: {
        type: Array,
        default: []
    },
    sentToGroups: {
        type: Array,
        default: []
    }
});

file.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })

module.exports = mongoose.model("file", file, "file");