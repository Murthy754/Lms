var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var invitations = new Schema({
    email: {
        type: String,
        required: true,
    },
    userId:{
        type:String,
        required:true
    },
    isTrunumUser:{
        type:Boolean,
        required:true
    },
    updatedAt: {
        type:Date,
        default:new Date()
    },
    createdAt: {
        type:Date,
        default:new Date()
    }

});
invitations.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })
module.exports = mongoose.model('invitations', invitations, 'invitations');