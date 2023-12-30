const privateSite = require("../models/Privatesite");

privatteSiteController = () => { };

privateSitePollController.getSettings = (req, res, next) => {
    console.log(req.params);
    privateSite.aggregate([
        {
            $match: {
                "settings.siteName": req.params.site
            }
        },
        {
            $project: {
                "messagePermission": 1,
                "allowAutomaticSubscription": 1,
                "privateTopicsPublicView": 1,
                "settings": 1,
                "isActive": 1
            }
        }
    ], (error, document) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Server side error occurred",
                error: error
            });
        } else {
            if (document) {
                let keys = Object.keys(document[0]);
                if (!keys.includes('isActive')) {
                    document[0]['isActive'] = true;
                }
            }
            res.status(200).json({
                success: true,
                message: "Settings retrived successfully",
                data: document[0]
            });
        }
    })
}

//changes the privatesite status to active or inactivate
privateSitePollController.changePrivatesiteStatus = (req, res, next) => {
    privateSite.updateOne({_id : req.body.privatesiteId},
            {$set: {isActive : req.body.status}}, (err,response) =>{
                if (err) {
                    res.status(500).json({
                        success: false,
                        message: "Server side Error Occured",
                        error : err
                    }) 
                } else {
                     res.status(200).json({
                        success: true,
                        message: "Private Site Deactivated Successfully",
                        data: response
                     })
                }
            }
        )
}

module.exports = privateSitePollController;