var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var user = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        email: true,
        unique: true
    },
    dob: {
        type: Date,
        default:null        
    },
    gender: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        default:"user"
    },
    emailVerified: {
        type: Boolean,
        default:false
    },
    emailSettings: {
        type: Boolean,
        default: true
    },
    phone: {
        type: String,
        default: null
    },
    userStatus: {
        type: String,
        required: true,
        default: 'Active'
    },
    profilePicture: {
        type: String,
        default:''
    },
    pollContributionCount: {
        type: Number,
        default: 0
    },
    pollVoteCount: {
        type: Number,
        default: 0
    },
    livestreamViewCount: {
        type: Number,
        default: 0
    },
    tokenId: {
        type: String
    },
    address: {
        type: JSON,
        default: {}
    },
    notifications: {
        type: Schema.Types.Mixed,
        default: {}
    },
    subscriptions: {
        type: Schema.Types.Mixed,
        default: {}
    },
    socialsite: {
        type: Schema.Types.Mixed,
        default: {}
    },
    savetoYoutube: {
        type: Boolean,
        default: true
    },
    youtube_status: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'public'
    },
    show_modal_box: {
        type: Boolean,
        default: true
    },
    privateSite:{
        type:Boolean,
        default:false
    },
    messagePermission:{
        type: Boolean,
        default: false
    },
    privateSiteSettings:{
        type: Schema.Types.Mixed,
        default: {}
    },
    onlineStatus: {
        type: Boolean,
        default: false
    },
    virtualUID: {
        type: Array,
        default: []
    },
    phoneTokenId: {
        type: String,
        default: ""
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    verifiedNumbersList: {
        type: Schema.Types.Mixed,
        default: []
    },
    createdAt: {
        type:Date,
        default: Date.now()
    },
      updatedAt: {
        type:Date,
        default: Date.now()
    },
    eligibleForUserBenefits: {
        type: Boolean,
        default: false
       }  
},{minimize:false});
user.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })
module.exports = mongoose.model("user", user, 'user');