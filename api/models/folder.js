const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const folder = new Schema({
    folderName: {       // Folder name
        type: String
    },
    type: {
        type: String,  // Defines the folder type: "root" or "child"
        default: "child"
    },
    parentFolder: {    // For a root folder default value is null
        type: Schema.Types.ObjectId,
        default: null
    },
    files: {            // Array of files in folder
        type: Array,
        default: []
    },
    metaData: {         // Meta data of folder
        type: Schema.Types.Mixed,
        default: {}
    },
    createdBy: {        // Created by User
        type: Schema.Types.ObjectId,
        ref: User
    },
    createdAt:{
        type:Date,
        default: Date.now()
      },
      updatedAt:{
        type:Date,
        default: Date.now()
      },
    isDeleted: {        // Deleted or not
        type: Boolean,
        default: false
    },
    privateSiteId: {    // Private site id
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

folder.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })

module.exports = mongoose.model("folder", folder, "folder");