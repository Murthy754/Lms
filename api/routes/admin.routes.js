const router = require('express').Router();
const adminController = require('../controllers/admin');
const globalConfigurationsController = require('../controllers/globalconfigurations');
const middlewares = require("../middlewares/authorization");

router.post('/admin/login', adminController.login);
router.post('/admin/logout', adminController.logout);
router.post('/admin/create', adminController.create);
router.get('/admin/user/:userId', adminController.getUserProfile);
router.put('/admin/recoverPassword', adminController.recoverPassword);
router.get('/admin/users/active', middlewares.requiresAdminLogin, adminController.getActiveUsers);
router.post('/admin/forgot/password', adminController.forgotPassword);
router.post('/admin/forgot/userName', adminController.forgotuserName);
// router.get('/admin/polls', adminController.getPolls);
// router.get('/admin/promotepolls', adminController.promotePolls);
// router.post('/admin/promotepoll/:id', adminController.createPromotePoll);
// router.put('/admin/promotepoll/:id', adminController.updatePromotedPoll);
router.post('/admin/broadcast/email', middlewares.requiresAdminLogin, adminController.broadcastEmail);
router.post('/admin/invite', middlewares.requiresAdminLogin, adminController.invite);
router.get('/admin/users', middlewares.requiresAdminLogin, adminController.getUsers);
router.get('/admin/global/configurations', middlewares.requiresAdminLogin, globalConfigurationsController.getConfigurations);
router.post('/admin/set/global/configurations', middlewares.requiresAdminLogin, globalConfigurationsController.setConfigurations);
router.post('/admin/updateCreatedAtForUsers',  adminController.updateCreatedAtForUsers);
router.get('/admin/getUserPrivateSitesStorage', adminController.getUserPrivateSitesStorage)

module.exports = router;
