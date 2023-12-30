var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var poll = new Schema(
  {
    pollster: {
      type: Schema.Types.ObjectId,
      index: true
    },
    question: {
      type: String,
      required: true
    },
    pollOptions: {
      type: Array
    },
    pollOptionsType: {
      type: String,
      required: true,
      enum: ["Choice", "Slider"]
    },
    articleInfo: {
      type: JSON
      // index:true
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Closed",
        "Disabled",
        "Expired",
        "Open",
        "Deleted",
        "Promoted",
        "InActive"
      ],
      index: true
    },
    categories: {
      type: Array,
      index: true
    },
    tags: {
      type: Array
    },

    flagPollByUserIds: {
      type: Array,
      default: []
    },
    retruth_by_ids: {
      type: Array,
      default: []
    },
    pollSubscription: {
      type: Array,
      default: []
    },
    pollCommentCount: {
      type: Number,
      default: 0
    },
    pollRetruthCount: {
      type: Number,
      default: 0
    },

    pollCastCount: {
      type: Number,
      default: 0
    },

    targetCountryCount: {
      type: Number,
      default: 0
    },
    pollCastCountByAnswer: {
      type: Schema.Types.Mixed,
      default: {}
    },
    targetCountryCountByAnswer: {
      type: Schema.Types.Mixed,
      default: {}
    },
    pollTags: {
      type: Array
    },
    country: {
      type: String,
      index: true
    },
    actionIt: {
      type: Boolean
    },
    expires: {
      type: Date,
      default: null
    },
    pollstatus: {
      type: String,
      // required: true,
      enum: ["Public", "Private", "Subscribers", "Specific_Subscribers"]
    },
    subscribers: {
      type: Array
    },
    privacyOptions: {
      type: JSON
    },
    youtube_id: String,
    youtube_status: String,
    youtube_file_isdeleted: {
      type: Boolean,
      default: false
    },
    createdAt:{
      type:Date,
      default: Date.now
    },
    updatedAt:{
      type:Date,
      default: Date.now
    },
    s3_file_isdeleted: {
      type: Boolean,
      default: false
    },
    streamId: {
      type: String
    },
    reference_from: {
      type: JSON
    },
    retruth_reason: {
      type: String
    },
    retruth_by: {
      type: Array
    },
    disableComments: {
      type: Boolean,
      default: false
    },
    privateSite:{
      type:Boolean,
      default:false
    },
    privateSiteSubsOnly:{
      type: Boolean,
      default: false
    },
    createdFor:{
      type:Schema.Types.Mixed,
      default:{}
    },
    siteOwnerId:{
      type: Schema.Types.ObjectId,
    },
    privateSiteId: {
      type: Schema.Types.ObjectId,
      default: null
    },
    verifiedVote: {
      type: Boolean,
      default: false
    },
    verifiedVoters: {
      type: Array,
      default: []
    }
  },
  { minimize: false }
);
poll.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
  if(this.getUpdate()) {
    this.getUpdate().updatedAt = Date.now();
    return next();
} 
next();
})

module.exports = mongoose.model("poll", poll, "poll");
