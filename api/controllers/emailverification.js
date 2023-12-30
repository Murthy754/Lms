const user = require('../models/User');

emailVerificationController = () => { };

emailVerificationController.verify = (req, res, next) => {
    const tokenId = req.params.id + "";
    user.findOneAndUpdate(
      {
        tokenId: tokenId
      },
      {
        $set: {
          emailVerified: true
        }
      },
      {
        new: true
      },
      (err, data) => {
        if (data) {
            res.redirect("/emailVerification/successful")
        } else {
          res.json({
            result: false,
            message: "Email verification failed"
          });
        }
      }
    );
};

module.exports = emailVerificationController;