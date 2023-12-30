var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var broadcast=new Schema({
    poll:{
        type: Schema.Types.ObjectId,
        required:true
    },
    pollster:{
        type: Schema.Types.ObjectId,
        required:true
    },
    broadcast:{
        type:Schema.Types.Mixed,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    replyCount:{
        type:Number,
        default:0
    }
});
broadcast.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })
module.exports=mongoose.model('broadcast',broadcast,'broadcast')