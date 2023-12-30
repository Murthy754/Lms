const { ObjectId } = require("mongodb");
const redis = require("redis");
const client = redis.createClient();
const globalConfigurations = require("../models/GlobalConfigurations");
const socketService = require("../services/socket-service");
globalConfigurationsController = () => { };

globalConfigurationsController.getConfigurations = (req, res, next) => {
    client.get("global_configurations", (error, data)=>{
        if (error) {
          res.status(500).json({
            success: false,
            message: "Server side error occurred",
            error: error
          });
        } else {
          if (data && data.length > 0) {
            res.status(200).json({
              success: true,
              configurations: JSON.parse(data),
              message: "Global configurations retrieved successfully"
            });
          } else {
            globalConfigurations.find({}).exec((err, document) => {
              if (err) {
                res.status(500).json({
                  success: false,
                  message: "Server side error occurred",
                  error: error
                });
              } else {
                if (document && document.length > 0) {
                  let data = document[0]["_doc"];
                  ['_id', '__v', 'type'].forEach(e => {
                    if (data[e]) {
                      delete data[e]
                    }
                  });
                  res.status(200).json({
                    success: true,
                    configurations: data,
                    message: "Global configurations retrieved successfully"
                  });
                } else {
                  res.status(200).json({
                    success: true,
                    message: "No global configurations found"
                  });
                }
              }
            });
          }
        }
      });
};

globalConfigurationsController.setConfigurations = (req, res, next) => {
    globalConfigurations.find({}).exec((error, document) => {
        if (document && document.length > 0) {
          let document_id = (document[0]["_id"]).toString();
          if (parseInt(req.body["main_site_storage"]) < 20) {
            return res.status(200).json({
              success: false,
              message: "Main site storage cannot be less than 20GB"
            });
          } else if (parseInt(req.body["private_site_storage"]) < 50) {
            return res.status(200).json({
              success: false,
              message: "Private site storage cannot be less than 50GB"
            });
          }
          globalConfigurations.replaceOne(
            {
              "_id": ObjectId(document_id)
            },
            req.body
          ).exec((err, update) => {
            if (err) {
              res.status(500).json({
                success: false,
                message: "Server side error occurred",
                error: err
              });
            } else {
              setConfigurationsInRedis(req.body).then(value => {
                res.status(201).json({
                  success: true,
                  message: "New Configurations added successfully"
                });
              });
              emitConfigurations();
            }
          })
        } else {
          if (parseInt(req.body["main_site_storage"]) < 20) {
            return res.status(200).json({
              success: false,
              message: "Main site storage cannot be less than 20GB"
            });
          } else if (parseInt(req.body["private_site_storage"]) < 50) {
            return res.status(200).json({
              success: false,
              message: "Private site storage cannot be less than 50GB"
            });
          }
          const configurations = new globalConfigurations();
          configurations.main_site_storage = req.body.main_site_storage;
          configurations.private_site_storage = req.body.private_site_storage;
          configurations.show_google_ads = req.body.show_google_ads;
          configurations.feed_ad_index = req.body.feed_ad_index;
          configurations.save((err, doc) => {
            if (err) {
              res.status(500).json({
                success: false,
                message: "Server side error occurred",
                error: err
              });
            } else {
              setConfigurationsInRedis(req.body).then(value => {
                res.status(200).json({
                  success: true,
                  message: "New Configurations added successfully"
                });
              });
              emitConfigurations();
            }
          })
        }
    });
};

emitConfigurations = () => {
  client.get("global_configurations", (error, data)=>{
    if (error) {
      console.log(error);
    } else {
      if (data && data.length > 0) {
        socketService.getIoObject().sockets.emit("GlobalConfigurations", data);
      }
    }
  });
  }


setConfigurationsInRedis = (configurations) => {
    return new Promise((resolve, reject) => {
      client.set("global_configurations", JSON.stringify(configurations), (error, success) => {
        resolve(true);
      })
    })
  }

module.exports = globalConfigurationsController;