var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var category=new Schema({
    name:{
        type:String
    }
});
module.exports=mongoose.model('category',category,'category');