var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var broadcastreplies=new Schema({
    poll: {
        type:Schema.Types.ObjectId,
        required:true
      },
      broadcast: {
        type:Schema.Types.ObjectId,
        required:true
      },
      thread:{
        type:Schema.Types.ObjectId,
        required:true
      },
      user:{
        type:Schema.Types.ObjectId,
        required:true
      },
      comment:{
        type:String,
        required:true
      },
      replytype:{
        type:String
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
broadcastreplies.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
  if(this.getUpdate()) {
    this.getUpdate().updatedAt = Date.now();
    return next();
} 
next();
})
module.exports=mongoose.model('broadcastreplies',broadcastreplies,'broadcastreplies');