var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require('./User');

var groups = new Schema({
  groupName: {
    type: String
  },
  groupMembers: {
    type: Array
  },
  groupIcon:{
    type: String,
    default:''
  },
  admins:{
      type:Array
  },
  createdBy:{
    type: Schema.Types.ObjectId,
    ref: User,
    required: true
  },
  createdAt:{
    type:Date,
    default: Date.now()
  },
  updatedAt:{
    type:Date,
    default: Date.now()
  },
  isDeleted:{
    type: Boolean,
    default: false
  },
  privateSiteId: {
    type: Schema.Types.ObjectId,
    default: null
  }
});
groups.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
  if(this.getUpdate()) {
    this.getUpdate().updatedAt = Date.now();
    return next();
} 
next();
})
module.exports = mongoose.model(
  "groups",
  groups,
  "groups"
);
