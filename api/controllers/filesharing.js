const { ObjectId } = require("mongodb");
const file = require('../models/file');
const folder = require('../models/folder');
const groups = require("../models/Groups");
const Message = require("../models/Message");
const filePermissions = require("../models/FilePermissions");
const MessageSubscription = require("../models/MessageSubscription");

fileSharingController = () => { };

// Gets peoples data for file sharing
fileSharingController.getPeoplesData = (req, res, next) => {
  let userId = req.params.id;
  let requestType = "$" + req.query.requestType;
  let siteValue = null;
  if (req.query.privateSiteId) {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  if (userId) {
    // if (req.query.privateSiteId) {
    //     MessageSubscription.aggregate(
    //       [
    //           {
    //               $match: {
    //                   // requestType: ObjectId(userId),
    //                   $or: [{
    //                     requestedTo: siteValue
    //                   }, {
    //                     requestedBy: siteValue
    //                   }],
    //                   $and: [{
    //                     privateSiteId: siteValue
    //                   }],
    //                   status: {
    //                     $eq: "ACCEPTED"
    //                   }
    //               }
    //           },
    //           {
    //               $lookup: {
    //                   from: "user",
    //                   let: {
    //                       userid: requestType
    //                   },
    //                   pipeline: [
    //                       {
    //                           $match: {
    //                               $expr: {
    //                                   $and: [
    //                                       {
    //                                           $eq: ["$_id", "$$userid"]
    //                                       }
    //                                   ]
    //                               }
    //                           }
    //                       },
    //                       {
    //                           $project: {
    //                               firstName: 1,
    //                               lastName: 1,
    //                               userName: 1,
    //                               userStatus: 1,
    //                               address: 1,
    //                               privateSite: 1,
    //                               profilePicture: 1,
    //                               email: 1,
    //                               id: 1,
    //                               onlineStatus: 1,
    //                               messagePermission: 1
    //                           }
    //                       }
    //                   ],
    //                   as: "user"
    //               }
    //           },
    //           {
    //               $unwind: "$user"
    //           }
    //       ], (err, data) => {
    //           if (err) {
    //               res.status(500).json(err);
    //           } else {
    //               res.status(200).json(data);
    //           }
    //       }
    //   )
    // } else {
    //     MessageSubscription.aggregate(
    //       [
    //           {
    //               $match: {
    //                   // requestType: ObjectId(userId),
    //                   $or: [{
    //                     requestedTo: ObjectId(userId)
    //                   }, {
    //                     requestedBy: ObjectId(userId)
    //                   }],
    //                   $and: [{
    //                     privateSiteId: siteValue
    //                   }],
    //                   status: {
    //                     $eq: "ACCEPTED"
    //                   }
    //               }
    //           },
    //           {
    //               $lookup: {
    //                   from: "user",
    //                   let: {
    //                       userid: requestType
    //                   },
    //                   pipeline: [
    //                       {
    //                           $match: {
    //                               $expr: {
    //                                   $and: [
    //                                       {
    //                                           $eq: ["$_id", "$$userid"]
    //                                       }
    //                                   ]
    //                               }
    //                           }
    //                       },
    //                       {
    //                           $project: {
    //                               firstName: 1,
    //                               lastName: 1,
    //                               userName: 1,
    //                               userStatus: 1,
    //                               address: 1,
    //                               privateSite: 1,
    //                               profilePicture: 1,
    //                               email: 1,
    //                               id: 1,
    //                               onlineStatus: 1,
    //                               messagePermission: 1
    //                           }
    //                       }
    //                   ],
    //                   as: "user"
    //               }
    //           },
    //           {
    //               $unwind: "$user"
    //           }
    //       ], (err, data) => {
    //           if (err) {
    //               res.status(500).json(err);
    //           } else {
    //               res.status(200).json(data);
    //           }
    //       }
    //   )
    // }

    MessageSubscription.aggregate(
      [
          {
              $match: {
                  $or: [{
                    requestedTo: ObjectId(userId)
                  }, {
                    requestedBy: ObjectId(userId)
                  }],
                  $and: [{
                    privateSiteId: siteValue
                  }],
                  status: {
                    $eq: "ACCEPTED"
                  }
              }
          }
          // {
          //     $lookup: {
          //         from: "user",
          //         let: {
          //             userid: requestType
          //         },
          //         pipeline: [
          //             {
          //                 $match: {
          //                     $expr: {
          //                         $and: [
          //                             {
          //                                 $eq: ["$_id", "$$userid"]
          //                             }
          //                         ]
          //                     }
          //                 }
          //             },
          //             {
          //                 $project: {
          //                     firstName: 1,
          //                     lastName: 1,
          //                     userName: 1,
          //                     userStatus: 1,
          //                     address: 1,
          //                     privateSite: 1,
          //                     profilePicture: 1,
          //                     email: 1,
          //                     id: 1,
          //                     onlineStatus: 1,
          //                     messagePermission: 1
          //                 }
          //             }
          //         ],
          //         as: "user"
          //     }
          // },
          // {
          //     $unwind: "$user"
          // }
      ], (err, data) => {
          if (err) {
              res.status(500).json(err);
          } else {
              res.status(200).json(data);
          }
      }
  )
  }
};

// Gets groups of current user
fileSharingController.getGroups = (req, res, next) => {
  let userid = req.params.id;
  if (userid) {
    groups.find(
      {
        $or: [
          {
            "groupMembers._id":{$in:[req.params.id]}
          },
          {
            admins: { $in: [req.params.id]}
          }
        ],
        $and: [
          {
            privateSiteId: null
          }
        ]
      }
    )
    .exec((err, data) => {
      if (!err) {
        res.status(200).json(data);
      } else {
        res.status(500).json(err);
      }
    });
  }
};

// Gets files between peers from messaging
fileSharingController.getMessageFilesBetweenUsers = (req, res, next) => {
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== "null") {
    siteValue = req.query.privateSiteId;
  }
  Message.aggregate(
    [
      {
        $match: {
          $or: [{
            sendTo: ObjectId(req.params.memberId)
          }, {
            sendTo: ObjectId(req.params.userId)
          }],
          $and: [{
            privateSiteId: siteValue
          }]
        }
      },
      {
        $match: {
          $or: [{
            createdBy: ObjectId(req.params.memberId)
          }, {
            createdBy: ObjectId(req.params.userId)
          }]
        }
      },
      {
        $match: {
          $and: [{
            files: { $exists: true, $not: { $size: 0 }}
          }]
        }
      },
      {
        $lookup: {
          from: "user",
          let: {
            userid: "$createdBy"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userid"]
                }
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                userName: 1,
                userStatus: 1,
                address: 1,
                profilePicture: 1,
                id: 1
              }
            }
          ],
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "user",
          let: {
            memberid: ObjectId(req.params.memberId)
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$memberid"]
                }
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                userName: 1,
                userStatus: 1,
                address: 1,
                profilePicture: 1,
                id: 1
              }
            }
          ],
          as: "member"
        }
      },
      {
        $unwind: "$member"
      }
    ], (error, data) => {
      if (error) {
        res.json(error);
      } else {
        res.json(data);
      }
    }
  );
};

// Stores files to DB
fileSharingController.saveFile = (req, res, next) => {
  let fileData = new file();
  fileData.fileName = req.body.name;
  fileData.url = req.body.location;
  fileData.createdBy = req.body.createdBy;
  fileData.parentFolder = req.body.folder;
  fileData.metaData = req.body.metaData;
  fileData.privateSiteId = req.body.privateSiteId;
  fileData.createdAt = req.body.createdAt;
  fileData.updatedAt = req.body.updatedAt;
  fileData.save((error, fileDoc) => {
    if (!error) {
      folder.findByIdAndUpdate(
        { _id: ObjectId(req.body.folder) },
        {
          $push: {
            files: fileDoc._id
          }
        },  (err, doc) => {
          if (err) {
            console.log(err);
          } else {
            res.json(fileDoc);
          }
        }
      )
    } else {
      console.log("File save error ", error);
    }
  });
};

// Check root folder exists. If not exists creates a root folder
fileSharingController.checkRootFolder = (req, res, next) => {
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== 'null') {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  folder.find({
    type: "root",
    createdBy: ObjectId(req.params.id),
    privateSiteId: siteValue
  }).exec((error, data) => {
    if (error) {
      res.status(500).json({
        result: false,
        message: "Server side error occurred. Please try again later."
      })
    }
    if (data.length < 1) {
      let rootFolderObj = new folder();
      rootFolderObj.folderName = "root";
      rootFolderObj.parentFolder = null;
      rootFolderObj.createdBy = ObjectId(req.params.id);
      rootFolderObj.type = "root";
      rootFolderObj.privateSiteId = siteValue;
      rootFolderObj.save((err, doc) => {
        if (err) {
          res.send({ result: false, doc: [] });
        } else {
          res.send({ result: true , doc: doc["_id"]});
        }
      });
    } else  {
      res.send({ result: true , doc: data[0]["_id"]});
    }
  });
};

// Check message folder exists. If not exists creates a messages folder
fileSharingController.checkMessagesFolder = (req, res, next) => {
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== 'null') {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  folder.find({
    type: "message",
    createdBy: ObjectId(req.params.id),
    privateSiteId: siteValue
  }).exec((err, data) => {
    if (data.length < 1) {
      let messageFolderObj = new folder();
      messageFolderObj.folderName = "Messages";
      messageFolderObj.parentFolder = ObjectId(req.params.folderId);
      messageFolderObj.createdBy = ObjectId(req.params.id);
      messageFolderObj.type = "message";
      messageFolderObj.save((error, doc) => {
        if (error) {
          res.send({ result: false, doc: [] });
        } else {
          res.send({ result: true, doc: doc});
        }
      });
    } else {
      res.send({ result: false, doc: data[0] });
    }
  })
};

// Creates new folder
fileSharingController.createNewFolder = (req, res, next) => {
  let siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = req.body.privateSiteId;
  }
  let folderObj = new folder();
  folderObj.folderName = req.body.folderName;
  folderObj.createdBy = req.body.createdBy;
  folderObj.parentFolder = req.body.parentFolder;
  folderObj.metaData = req.body.metaData;
  folderObj.privateSiteId = siteValue;

  folderObj.save((error, document) => {
    (!error) ? res.json({ result: true, message: "Folder created successfully", doc: document}) : res.json({ result: false, message: "Error occurred.", doc: document});
  });
};

// Gets user folders
fileSharingController.getMyFolders = (req, res, next) => {
  folder.find({
    parentFolder: ObjectId(req.params.folderId),
    type: "child",
    isDeleted: false
  }).sort({ createdAt: 1 }).exec((error, docs) => {
    if (error) {
      console.error(error);
      res.json({ result: false, folders: [] });
    } else {
      console.log(docs);
      res.json({ result: true, folders: docs });
    }
  });
};

// Gets user files
fileSharingController.getMyFiles = (req, res, next) => {
  file.find({
    parentFolder: ObjectId(req.params.folderId),
    createdBy: ObjectId(req.params.id),
    isDeleted: false
  }).sort({ createdAt: 1 }).exec((error, docs) => {
    if (error) {
      console.error(error);
      res.json({ result: false, files: [] });
    } else {
      res.json({ result: true, files: docs });
    }
  });
};

// Gets child folders data
fileSharingController.getChildFolders = (req, res, next) => {
  console.log(req.params);
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== "null") {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  folder.find({
    parentFolder: ObjectId(req.params.folderId),
    privateSiteId: siteValue,
    type: req.params.folderType,
    isDeleted: false
  }).exec((error, docs) => {
    if (error) {
      console.error(error);
      res.json({ result: false, folders: []});
    } else {
      res.json({ result: true, folders: docs});
    }
  })
};

// Gets folder files data
fileSharingController.getChildFiles = (req, res, next) => {
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== "null") {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  file.find({
    parentFolder: ObjectId(req.params.folderId),
    privateSiteId: siteValue,
    isDeleted: false
  }).sort({ createdAt: 1 }).exec((error, docs) => {
    if (error) {
      console.error(error);
      res.json({ result: false, files: []});
    } else {
      res.json({ result: true, files: docs});
    }
  });
};

// Gets message Folder files
fileSharingController.getMessageFolderFiles = (req, res, next) => {
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== "null") {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  Message.find({
    createdBy: ObjectId(req.params.id),
    privateSiteId: siteValue,
    isDeleted: false,
    files: {
      $exists: true,
      $ne: []
    }
  }).sort({ createdAt: 1 }).exec((error, docs) => {
    (error) ? res.json({ result: false, files: [] }) : res.json({ result: true, files: docs });
  })
};

// Gets trash folders and files
fileSharingController.getTrashData = (req, res, next) => {
  let folders = [];
  let files = [];
  folder.find({
    createdBy: ObjectId(req.params.id),
    isDeleted: true
  }).sort({ createdAt: 1 }).exec((error, trashFolders) => {
    if (error) {
      res.json({ result: false, error: error });
    } else {
      for (let i = 0; i < trashFolders.length; i++) {
        let folder = {
          "folderId": trashFolders[i]["_doc"]["_id"],
          "folderName": trashFolders[i]["_doc"]["folderName"],
          "folderOwner": "Me",
          "folderTime": trashFolders[i]["_doc"]["createdAt"],
          "folderSize": "--",
          "folderType": trashFolders[i]["_doc"]["type"],
          "folderDeleted": trashFolders[i]["_doc"]["isDeleted"]
        };
        folders.push(folder);
      }
      file.find({
        createdBy: ObjectId(req.params.id),
        isDeleted: true
      }, (err, trashFiles) => {
        if (err) {
          res.json({ result: false, error: err });
        } else {
          for (let i = 0; i < trashFiles.length; i++) {
            let file = {
              "fileId": trashFiles[i]["_doc"]["_id"],
              "fileName": trashFiles[i]["_doc"]["fileName"],
              "fileOwner": "Me",
              "fileTime": trashFiles[i]["_doc"]["createdAt"],
              "fileSize": trashFiles[i]["_doc"]["metaData"]["size"],
              "fileType": trashFiles[i]["_doc"]["type"],
              "fileDeleted": trashFiles[i]["isDeleted"]
            };
            files.push(file);
          }
          res.status(200).json({ result: true, trashFolders: folders, trashFiles: files });
        }
      });
    }
  });
};

// Restores files and folders
fileSharingController.restoreData = (req, res, next) => {
  if (req.body.type === "folder") {
    folder.updateOne({
      _id: ObjectId(req.body.id)
    },
    {
      $set: {
        isDeleted: false
      }
    }, (error, doc) => {
      if (error) {
        res.status(404).json({ result: false, message: "Server side error occurred" });
      } else if (doc.n === 0) {
        res.status(500).json({ result: false, message: "Folder restoration error. Please try again." });
      } else {
        res.status(200).json({ result: true, message: "Folder restored successfully" });
      }
    });
  } else {
    file.updateOne({
      _id: ObjectId(req.body.id)
    },
    {
      $set: {
        isDeleted: false
      }
    }, (error, doc) => {
      if (error) {
        res.status(500).json({ result: false, message: "Server side error occurred" });
      } else if (doc.n === 0) {
        res.status(500).json({ result: false, message: "File restoration error. Please try again." });
      } else {
        res.status(200).json({ result: true, message: "File restored successfully" });
      }
    });
  }
};

// Removes file
fileSharingController.removeFile = (req, res, next) => {
  file.updateOne({
    _id: ObjectId(req.body.fileId)
  }, 
  {
    $set: {
      isDeleted: true
    }
  }, (error, doc) => {
    if (error) {
      res.status(500).json({ result: false, message: "Server side error occurred. Please try again." });
    } else if (doc.n === 0) {
      res.status(500).json({ result: false, message: "File deletion error. Please try again." });
    } else {
      res.status(200).json({ result: true, message: "File moved to trash" });
    }
  })
};

// Remove Folder
fileSharingController.removeFolder = (req, res, next) => {
  folder.updateOne({
    _id: ObjectId(req.body.id)
  },
  {
    $set: {
      isDeleted: true
    }
  }, (error, doc) => {
    if (error) {
      res.status(500).json({ result: false, message: "Server side error occurred. Please try again." });
    } else if (doc.n === 0) {
      res.status(500).json({ result: false, message: "Folder deletion error. Please try again." });
    } else {
      // if (req.body.filesList) {
      //   for (let i=0; i < req.body.filesList.length; i++) {
      //     file.updateOne({
      //       _id: ObjectId(req.body.filesList[i])
      //     }, {
      //       $set: {
      //         isDeleted: true
      //       }
      //     }, (err, doc) => {});
      //   }
      //   res.status(200).json({ result: true, message: "Folder moved to trash" });
      // } else {
        res.status(200).json({ result: true, message: "Folder moved to trash" });
      // }
    }
  })
};

// Calculates storage value of all the files and folders
fileSharingController.getStorageUsed = (req, res, next) => {
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== "null") {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  // Gets all files metaData created by current user and calculates the total size
  file.aggregate([
    {
      $match: {
        createdBy: ObjectId(req.params.id),
        privateSiteId: siteValue
      }
    },
    {
      $project: {
        metaData: 1
      }
    }
  ]).exec((error, docs) => {
    console.log(error, docs);
    var totalStorageUsed = 0;
    if (error) {
      res.json({ result: false, error: error });
      return;
    }
    
    if (docs.length > 0) {
      for (let i = 0; i < docs.length; i++) {
        totalStorageUsed = totalStorageUsed + docs[i]["metaData"]["size"];
      }
    }
    res.status(200).json({ result: true, storageUsed: totalStorageUsed.toFixed(2) });
  });
};

// Rename file
fileSharingController.rename = (req, res, next) => {
  if (req.body.type === "file") {
    file.updateOne({
      _id: ObjectId(req.body.fileId)
    }, {
      $set: {
        fileName: req.body.renameString,
        updatedAt: req.body.updatedAt
      }
    }, (error, doc) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Server side error occurred"
        });
      } else {
        if (doc.nModified === 1) {
          res.status(200).json({
            success: true,
            message: "File rename successfull"
          });
        } else {
          res.status(301).json({
            success: false,
            message: "File rename failed"
          });
        }
      }
    });
  } else {
    folder.updateOne({
      _id: ObjectId(req.body.folderId)
    }, {
      $set: {
        folderName: req.body.renameString,
        updatedAt: req.body.updatedAt
      }
    }, (error, doc) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Server side error occurred"
        });
      } else {
        if (doc.nModified === 1) {
          res.status(200).json({
            success: true,
            message: "Folder rename successfull"
          });
        } else {
          res.status(301).json({
            success: false,
            message: "Folder rename failed"
          });
        }
      }
    });
  }
};

// Gets loggin user shared files
fileSharingController.getSharedWithMeData = (req, res, next) => {
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== "null") {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  let promises = [];
  if (req.params.id) {
    const foldersPromise = new Promise((resolve, reject) => {
      // Checking in the folders
      folder.aggregate([
        {
          $match: {
            sentToUsers: { $in: [req.params.id]}
          }
        },
        {
          $match: {
            privateSiteId: siteValue
          }
        },
        {
          $match: {
            isDeleted: false
          }
        }
      ], (error, docs) => {
        console.log(error, docs);
        if (error) {
          res.status(500).json({
            success: false,
            message: error
          });
        } else {
          resolve(docs);
        }
      });
    });

    promises.push(foldersPromise);

    const filesPromise = new Promise((resolve, reject) => {
      // Checking in the files
      file.aggregate([
        {
          $match: {
            sentToUsers: { $in: [req.params.id]}
          }
        },
        {
          $match: {
            privateSiteId: siteValue
          }
        },
        {
          $match: {
            isDeleted: false
          }
        }
      ], (error, docs) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: error
          });
        } else {
          resolve(docs);
        }
      });
    });

    promises.push(filesPromise);

    Promise.all(promises).then((result) => {
      console.log(result);
      res.status(200).json({
        success: true,
        folders: result[0],
        files: result[1]
      })
    }).catch((error) => {
      console.error(error);
      res.status(500).json({
        success: false,
        error: error
      });
    })
  } else {
    res.status(200).json({
      success: false,
      message: "Request parameters missing"
    });
  }
};

// Gets shared files from group
fileSharingController.getFilesInGroup = (req, res, next) => {
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== "null") {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  if (req.params.groupId) {
    let promises = [];
    const foldersPromise = new Promise((resolve, reject) => {
      // Checking in the folders
      folder.aggregate([
        {
          $match: {
            sentToGroups: { $in: [req.params.groupId]}
          }
        },
        {
          $match: {
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: "user",
            let: {
              userid: "$createdBy"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userid"]
                  }
                }
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  userName: 1,
                  userStatus: 1,
                  address: 1,
                  profilePicture: 1,
                  id: 1
                }
              }
            ],
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
      ], (error, docs) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: error
          });
        } else {
          resolve(docs);
        }
      });
    });

    promises.push(foldersPromise);

    const filesPromise = new Promise((resolve, reject) => {
      // Checking in the files
      file.aggregate([
        {
          $match: {
            sentToGroups: { $in: [req.params.groupId] }
          }
        },
        {
          $match: {
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: "user",
            let: {
              userid: "$createdBy"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userid"]
                  }
                }
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  userName: 1,
                  userStatus: 1,
                  address: 1,
                  profilePicture: 1,
                  id: 1
                }
              }
            ],
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
      ], (error, docs) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: error
          });
        } else {
          resolve(docs);
        }
      });
    });

    promises.push(filesPromise);

    Promise.all(promises).then((result) => {
      console.log(result);
      res.status(200).json({
        success: true,
        folders: result[0],
        files: result[1]
      });
    }).catch((error) => {
      console.error(error);
      res.status(500).json({
        success: false,
        error: error
      });
    });
  } else {
    res.json({
      success: true,
      message: "Missing params in request"
    });
  }
}

// Gets files between peers
fileSharingController.getFilesBetweenUsers = (req, res, next) => {
  let siteValue = null;
  if (req.query.privateSiteId && req.query.privateSiteId !== "null") {
    siteValue = ObjectId(req.query.privateSiteId);
  }
  if (req.params.memberId) {
    let promises = [];
    const foldersPromise = new Promise((resolve, reject) => {
      // Checking in the folders
      folder.aggregate([
        {
          $match: {
            $or: [{
              $and: [{
                sentToUsers: { $in: [req.params.memberId]},
              }, {
                createdBy: ObjectId(req.params.userId)
              }],
              $and: [{
                sentToUsers: { $in: [req.params.userId]},
              }, {
                createdBy: ObjectId(req.params.memberId)
              }],
            }]
            // $or: [{
            //   sentToUsers: { $in: [req.params.memberId]},
            // },
            // {
            //   sentToUsers: { $in: [req.params.userId]},
            // }]
          }
        },
        {
          $match: {
            privateSiteId: siteValue
          }
        },
        {
          $match: {
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: "user",
            let: {
              userid: "$createdBy"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userid"]
                  }
                }
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  userName: 1,
                  userStatus: 1,
                  address: 1,
                  profilePicture: 1,
                  id: 1
                }
              }
            ],
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
      ], (error, docs) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: error
          });
        } else {
          resolve(docs);
        }
      });
    });

    promises.push(foldersPromise);

    const filesPromise = new Promise((resolve, reject) => {
      // Checking in the files
      file.aggregate([
        {
          $match: {
            $or: [{
              $and: [{
                sentToUsers: { $in: [req.params.memberId]},
              }, {
                createdBy: ObjectId(req.params.userId)
              }],
              $and: [{
                sentToUsers: { $in: [req.params.userId]},
              }, {
                createdBy: ObjectId(req.params.memberId)
              }],
            }]
          }
        },
        {
          $match: {
            privateSiteId: siteValue
          }
        },
        {
          $match: {
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: "user",
            let: {
              userid: "$createdBy"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userid"]
                  }
                }
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  userName: 1,
                  userStatus: 1,
                  address: 1,
                  profilePicture: 1,
                  id: 1
                }
              }
            ],
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
      ], (error, docs) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: error
          });
        } else {
          resolve(docs);
        }
      });
    });

    promises.push(filesPromise);

    Promise.all(promises).then((result) => {
      console.log(result);
      res.status(200).json({
        success: true,
        folders: result[0],
        files: result[1]
      })
    }).catch((error) => {
      console.error(error);
      res.status(500).json({
        success: false,
        error: error
      });
    });
  } else {
    res.json({
      success: true,
      message: "Missing params in request"
    });
  }
};

fileSharingController.shareData = (req, res, next) => {
  let siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  if (req.body.type === 'folder') {
    folder.updateOne(
      {
        _id: ObjectId(req.body.folderId),
        privateSiteId: siteValue
      },
      {
        $set: {
          sentToUsers: req.body.sentToUsers,
          sentToGroups: req.body.sentToGroups
        }
      }
    , (error, response) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Server side error occurred"
        });
      } else {
        if (response.nModified === 1) {
          res.status(200).json({
            success: true,
            message: "Folder shared successfully"
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Folder share failed. Please try again later."
          });
        }
      }
    });
  } else {
    file.updateOne(
      {
        _id: ObjectId(req.body.fileId),
        privateSiteId: siteValue
      },
      {
        $set: {
          sentToUsers: req.body.sentToUsers,
          sentToGroups: req.body.sentToGroups
        }
      }
    , (error, response) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Server side error occurred"
        });
      } else {
        if (response.nModified === 1) {
          res.status(200).json({
            success: true,
            message: "File shared successfully"
          });
        } else {
          res.status(200).json({
            success: true,
            message: "File share failed. Please try again later."
          });
        }
      }
    });
  }
};

fileSharingController.move = (req, res, next) => {
  console.log(req.body);
  let siteValue = null;
  if (req.body.privateSiteId && req.body.privateSiteId !== "null") {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  if (req.body.requestType === "folder") {
    folder.updateOne(
      {
        _id: ObjectId(req.body.previousFolderId),
        privateSiteId: siteValue
      },
      {
        $set: {
          parentFolder: req.body.newFolderId
        }
      }
    , (error, response) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Server side error occurred. Please try again later."
        });
      } else {
        if (response.nModified === 1) {
          res.status(200).json({
            success: false,
            message: "Folder move failed"
          });
        }
        res.status(200).json({
          success: true,
          message: "Folder moved successfully"
        });
      }
    });
  } else {
    file.updateOne(
      {
        _id: ObjectId(req.body.previousFolderId),
        privateSiteId: siteValue
      },
      {
        $set: {
          parentFolder: req.body.newFolderId
        }
      }
    , (error, response) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Server side error occurred. Please try again later."
        });
      } else {
        if (response.nModified === 1) {
          res.status(200).json({
            success: true,
            message: "File moved successfully"
          });
        } else {
          res.status(200).json({
            success: false,
            message: "File move failed"
          });
        }
      }
    });
  }
};

fileSharingController.shareFolder = (req, res, next) => {
  let siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
      
  if (req.body.sentToGroups) {
    folder.updateOne(
      {
        _id: ObjectId(req.body.folderId),
        privateSiteId: siteValue
      },
      {
        $addToSet: {
          sentToGroups: req.body.sentToGroups
        }
      }, (error, response) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: "Server side error occurred. Please try again."
          });
        } else {
          if (response.nModified === 1) {
            res.status(200).json({
              success: true,
              message: "Folder shared successfully"
            });
          } else {
            res.status(200).json({
              success: true,
              message: "Item already shared"
            });
          }
        }
      }
    )
  } else {
    folder.updateOne(
      {
        _id: ObjectId(req.body.folderId),
        privateSiteId: siteValue
      },
      {
        $addToSet: {
          sentToUsers: req.body.sentToUsers
        }
      }, (error, response) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: "Server side error occurred. Please try again."
          });
        } else {
          if (response.nModified === 1) {
            res.status(200).json({
              success: true,
              message: "Folder shared successfully"
            });
          } else {
            res.status(200).json({
              success: true,
              message: "Item already shared"
            });
          }
        }
      }
    )
  }
};

fileSharingController.shareFile = (req, res, next) => {
  let siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }

  if (req.body.sentToGroups) {
    file.updateOne(
      {
        _id: ObjectId(req.body.fileId),
        privateSiteId: siteValue
      },
      {
        $addToSet: {
          sentToGroups: req.body.sentToGroups
        }
      }, (error, response) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: "Server side error occurred. Please try again."
          });
        } else {
          if (response.nModified === 1) {
            res.status(200).json({
              success: true,
              message: "File shared successfully"
            });
          } else {
            res.status(200).json({
              success: true,
              message: "Item already shared"
            });
          }
        }
      }
    )
  } else {
    file.updateOne(
      {
        _id: ObjectId(req.body.fileId),
        privateSiteId: siteValue
      },
      {
        $addToSet: {
          sentToUsers: req.body.sentToUsers
        }
      }, (error, response) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: "Server side error occurred. Please try again."
          });
        } else {
          if (response.nModified === 1) {
            res.status(200).json({
              success: true,
              message: "File shared successfully"
            });
          } else {
            res.status(200).json({
              success: true,
              message: "Item already shared"
            });
          }
        }
      }
    );
  }
};

fileSharingController.getPreviousFolder = (req, res, next) => {
  folder.findById({
    _id: ObjectId(req.params.id)
  }).exec((error, response) => {
    if (error) {
      res.status(200).json({
        success: false,
        message: "Server side error occurred"
      });
    } else {
      res.status(200).json({
        success: true,
        doc: response
      });
    }
  });
};

fileSharingController.getFilePermissions = (req, res, next) => {
  if (req.params.isAdmin === "true") {
    if (req.params.privateSiteId && req.params.privateSiteId !== 'null') {
      filePermissions.find({
        privateSiteId: ObjectId(req.params.privateSiteId)
      }).exec((error, doc) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: "Server side error occurred."
          });
        } else if (doc && doc.length === 0) {
          let filePermissionsObj = new filePermissions({
             privateSiteId: req.params.privateSiteId,
             blocked: {
              fileAccess: [],
               upload: [],
               download: []
             }
            });
          filePermissionsObj.save((error, result) => {
            if (error) {
              res.status(500).json({
                success: false,
                message: "Server side error occurred"
              });
            } else {
              res.status(200).json({
                success: true,
                doc: result
              })
            }
          });
        } else {
          res.status(200).json({
            success: true,
            doc: doc
          });
        }
      });
    }
  } else {
    if (req.params.privateSiteId && req.params.privateSiteId !== "null") {
      filePermissions.find({
        privateSiteId: ObjectId(req.params.privateSiteId)
      }).exec((error, doc) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: "Server side error occurred."
          });
        } else if (doc && doc.length > 0) {
          res.status(200).json({
            success: true,
            doc: doc
          });
        } else {
          res.send(error);
        }
      });
    } else {
      res.status(200).json({
        success: true,
        doc: []
      });
    }
  }
};

fileSharingController.saveFileAccessSettings = (req, res, next) => {
  filePermissions.updateOne(
    {
    privateSiteId: ObjectId(req.body.privateSiteId)
    },
    {
      $set: {
        blocked: {
          fileAccess: req.body.blockedFileAccess,
          upload: req.body.blockedUpload,
          download: req.body.blockedDownload
        }
      }
    }, (error, response) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Server side error occcurred"
      });
    } else {
      if (response.nModified === 1) {
        res.status(200).json({
          success: true,
          message: "Settings updated"
        });
      } else {
        res.status(200).json({
          success: false,
          message: "Settings already up-to-date"
        });
      }
    }
  });
}

fileSharingController.updateParentFolder = (req, res, next) => {
  let siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = ObjectId(req.body.privateSiteId);
  }
  folder.updateOne(
    {
      _id: ObjectId(req.body.folderId),
      privateSiteId: siteValue
    },
    {
      $set: {
        parentFolder: req.body.parentFolder
      }
    }, (error, response) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Server side error occcurred"
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Folder updated"
      });
    }
  });
}

fileSharingController.uploadFolder = (req, res) => {
  let files = req.body.files;
  let directories = req.body.directories;

  // Create root folder
  let folderObj = new folder();
  let siteValue = null;
  if (req.body.privateSiteId) {
    siteValue = req.body.privateSiteId;
  }
  folderObj.folderName = directories[0].split("/")[0];
  folderObj.createdBy = req.body.ownerId;
  folderObj.parentFolder = req.body.parentFolder;
  folderObj.metaData = {
    ownerName: req.body.ownerName,
    ownerId: req.body.ownerId
  }
  folderObj.privateSiteId = siteValue;

  folderObj.save((error, document) => {
    if (document) {
      let rootFolderId = (document["_doc"]["_id"]).toString();
      let paths = [];
      let foldersPromises = [];
      directories.forEach((directory) => {
        let folders = directory.split('/');
        folders.splice(folders.length - 1, 1);
        folders.splice(0, 1);
        if (folders.length !== 0 && !paths.includes(folders)) {
          paths.push(folders);
        }
      });
      let unique = paths.map(cur => JSON.stringify(cur))
        .filter(function(curr, index, self) {
          return self.indexOf(curr) == index;
        })
        .map(cur => JSON.parse(cur))

      if (unique.length > 0) {
        let filePromises = [];
        let childFolderPromises = [];
        // Create child folders
        unique.forEach((path) => {
          path.forEach((directory) => {
            let data = {
              privateSiteId: req.body.privateSiteId,
              folderName: directory,
              createdBy: req.body.ownerId,
              parentFolder: null,
              metaData: {
                ownerName: req.body.ownerName,
                ownerId: req.body.ownerId
              }
            }
            foldersPromises.push(fileSharingController.createFolderPromise(data));
          });
        });

        Promise.all(foldersPromises).then((results) => {
          let foldersList = results;
          let rootFolder = {
            [directories[0].split('/')[0]]: rootFolderId
          }
          foldersList.push(rootFolder);
          console.log(results, unique, directories);
          unique.forEach((folders) => {
            if (folders.length === 1) {
              let folder = results.filter((folder) => Object.keys(folder)[0] === folders[0]);
              let folderId = folder[0];
              let folderData = {
                folderId: folderId[folders[0]],
                privateSiteId: req.body.privateSiteId,
                parentFolder: rootFolderId
              }
              childFolderPromises.push(fileSharingController.updateChildeFolder(folderData));
            } else {
              let index = 0;
              folders.forEach((folder) => {
                if (index === 0) {
                  let folderData = results.filter((folder) => Object.keys(folder)[0] === folders[0]);
                  let folderId = folderData[0];
                  let data = {
                    folderId: folderId[folder],
                    privateSiteId: req.body.privateSiteId,
                    parentFolder: rootFolderId
                  }
                  childFolderPromises.push(fileSharingController.updateChildeFolder(data));
                } else {
                  let folderData = results.filter((folder) => Object.keys(folder)[0] === folders[index]);
                  let folderId = folderData[0];
                  let parentFolderData = results.filter((folder) => Object.keys(folder)[0] === folders[index - 1]);
                  let parentFolderId = parentFolderData[0];
                  let data = {
                    folderId: folderId[folder],
                    privateSiteId: req.body.privateSiteId,
                    parentFolder: parentFolderId[folders[index - 1]]
                  }
                  childFolderPromises.push(fileSharingController.updateChildeFolder(data));
                }
                index = index + 1;
              });
            }
          })

          Promise.all(childFolderPromises).then((result) => {
            files.forEach((file) => {
              let folder = foldersList.filter((folder) => Object.keys(folder)[0] === file.parent);
              let name = (file.key && file.key.length > 0) ? file.key : file.Key;
              let data = {
                name: name,
                location: file.Location,
                createdBy: req.body.ownerId,
                folder: folder[0][file.parent],
                metaData: {
                  ownerName: req.body.ownerName,
                  ownerId: req.body.ownerId,
                  size: file.size,
                  type: file.type
                },
                privateSiteId: req.body.privateSiteId,
                createdAt: Date.now(),
                updatedAt: Date.now()
              }
    
              filePromises.push(fileSharingController.createFilePromise(data));
            });
            Promise.all(filePromises).then((result) => {
              if (result.length === filePromises.length) {
                res.status(200).json({
                  success: true,
                  message: "Folder uploaded successfully"
                });
              }
            }).catch(err => {
              res.status(500).json(err)
            })
          }).catch(err => {
            res.json({
              success: false,
              message: "Server side error occcurred"
            })
          })
        });
      } else { // Save files in root directory
        let filePromises = [];
        files.forEach((file) => {
          let name = (file.key && file.key.length > 0) ? file.key : file.Key;
          let data = {
            name: name,
            location: file.Location,
            createdBy: req.body.ownerId,
            folder: rootFolderId,
            metaData: {
              ownerName: req.body.ownerName,
              ownerId: req.body.ownerId,
              size: file.size,
              type: file.type
            },
            privateSiteId: req.body.privateSiteId,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }

          filePromises.push(fileSharingController.createFilePromise(data));
        })

        Promise.all(filePromises).then((result) => {
          if (filePromises.length === result.length) {
            res.status(200).json({
              success: true,
              message: "Folder uploaded successfully"
            });
          }
        }).catch(err => {
          res.json({
            success: false,
            message: "Server side error occcurred"
          })
        });
      }
    }
  });
}

fileSharingController.createFolderPromise = (data) => {
  return new Promise((resolve, reject) => {
      let siteValue = null;
      if (data.privateSiteId) {
        siteValue = data.privateSiteId;
      }
      let folderObj = new folder();
      folderObj.folderName = data.folderName;
      folderObj.createdBy = data.createdBy;
      folderObj.parentFolder = null;
      folderObj.metaData = data.metaData;
      folderObj.privateSiteId = siteValue;

      folderObj.save((error, document) => {
        if (document) {
          resolve({ [data.folderName]: (document["_doc"]["_id"]).toString() });
        }
      });
  })
}

fileSharingController.createFilePromise = (data) => {
  return new Promise((resolve, reject) => {
    let fileData = new file();
    fileData.fileName = data.name;
    fileData.url = data.location;
    fileData.createdBy = data.createdBy;
    fileData.parentFolder = data.folder;
    fileData.metaData = data.metaData;
    fileData.privateSiteId = data.privateSiteId;
    fileData.createdAt = data.createdAt;
    fileData.updatedAt = data.updatedAt;
    fileData.save((error, fileDoc) => {
      if (!error) {
        folder.findByIdAndUpdate(
          { _id: ObjectId(data.parentFolderId) },
          {
            $push: {
              files: fileDoc._id
            }
          },  (err, doc) => {
            if (err) {
              console.log(err);
            } else {
              resolve("File created");
            }
          }
        )
      }
    });
  })
}

fileSharingController.updateChildeFolder = (data) => {
  return new Promise((resolve, reject) => {
    let siteValue = null;
    if (data.privateSiteId) {
      siteValue = ObjectId(data.privateSiteId);
    }
    folder.updateOne(
      {
        _id: ObjectId(data.folderId),
        privateSiteId: siteValue
      },
      {
        $set: {
          parentFolder: data.parentFolder
        }
      }, (error, response) => {
        resolve("Folder updated");
    });
  });
}

module.exports = fileSharingController;