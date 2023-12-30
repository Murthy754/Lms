const mongoose = require("mongoose");
const schema = mongoose.Schema;

const globalConfigurations = new schema({
    main_site_storage: {
        type: Number
    },
    private_site_storage: {
        type: Number
    },
    show_google_ads: {
        type: Boolean
    },
    feed_ad_index: {
        type: Number,
        default: 4
    },
    topics_per_page: {
        type: Number,
        default: 6
    },
    type: {
        type: String,
        default: "_tn_configurations"
    },
    private_site_subscriber_limit: {
        type: Number,
        default: 0
    },
    private_sites_limit: {
        type: Number,
        default: 5
    },
    createdAt:{
        type:Date,
        default: Date.now()
      },
      updatedAt:{
        type:Date,
        default: Date.now()
      },
      tabPreference:{
        type: String
      }
});

globalConfigurations.pre(/^(updateOne|update|findOneAndUpdate)/, function(next) {
    if(this.getUpdate()) {
      this.getUpdate().updatedAt = Date.now();
      return next();
  } 
  next();
  })

module.exports = mongoose.model("globalConfigurations", globalConfigurations, "globalConfigurations");