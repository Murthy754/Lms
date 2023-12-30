const router = require('express').Router();
const middlewares = require('../middlewares/authorization');
const broadcastController = require('../controllers/broadcast');
const categoriesController = require('../controllers/categories');
const commentsController = require('../controllers/comments');
const emailVerificationController = require('../controllers/emailverification');
const fileSharingController = require('../controllers/filesharing');
const groupsController = require('../controllers/groups');
const messageController = require('../controllers/message');
const userController = require('../controllers/user');
const notificationController = require('../controllers/notification');
const pollController = require('../controllers/poll');
const privatesitePollController = require('../controllers/privatesitepoll');
const signupController = require('../controllers/signup');
const profileController = require('../controllers/profile');
const retruthController = require('../controllers/retruth');
const subscriptionController = require('../controllers/subscription');
const commonController = require('../controllers/common');
const globalConfigurationsController = require('../controllers/globalconfigurations');
const privateSiteController = require('../controllers/privateSite');

// Broadccast routes
router.post("/broadcast/savebroadcast", broadcastController.savebroadcast);
router.post("/broadcast/savebroadcastreply", broadcastController.savebroadcastreply);
router.post("/broadcast/getbroadcasts", broadcastController.getbroadcasts);
router.post("/broadcast/getprivatebroadcasts", broadcastController.getprivatebroadcasts);
router.post("/broadcast/getbroadcastsreplies", broadcastController.getbroadcastsreplies);
router.post("/broadcast/getbroadcastsrepliesall", broadcastController.getbroadcastsrepliesall);
router.put("/broadcast/incremntreplybroadcastcount", broadcastController.incremntreplybroadcastcount);
router.put("/broadcast/decremntbroadcastcount", broadcastController.decremntbroadcastcount);

// Categories routes
router.get('/categories/getAllCategories', categoriesController.getAllCategories);
router.post('/categories/addCategory', categoriesController.addCategory);
router.delete('/categories/removeCategory/:id', categoriesController.removeCategory);

// Comments routes
router.post("/comment/postcomment", commentsController.postcomment);
router.post("/comment/postcommentreply", commentsController.postcommentreply);
router.post("/comment/getcomments", commentsController.getcomments);
router.post("/comment/getprivatecomments", commentsController.getprivatecomments);
router.post("/comment/getcommentrepliesthread", commentsController.getcommentrepliesthread);
router.post("/comment/getcommentsreply", commentsController.getcommentsreply);
router.put("/comment/incremntcommentcount", commentsController.incremntcommentcount);
router.put("/comment/incremntreplycommentcount", commentsController.incremntreplycommentcount);
router.put("/comment/decremntcommentcount", commentsController.decremntcommentcount);
router.put("/comment/decremntreplycommentcount", commentsController.decremntreplycommentcount);
router.delete("/comment/deletecomment/:id", commentsController.deletecomment);
router.delete("/comment/deletereplycomment/:id", commentsController.deletereplycomment);

// Email verification routes
router.get("/email/verify/:id", emailVerificationController.verify);

//Common routes
router.get("/search",commonController.search);

// File sharing routes
router.get("/fileSharing/peoples/:id", middlewares.checkLogin, fileSharingController.getPeoplesData);
router.get("/fileSharing/groups/:id", middlewares.checkLogin, fileSharingController.getGroups);
router.get("/fileSharing/files/messages/:memberId/:userId", fileSharingController.getMessageFilesBetweenUsers);
router.get("/fileSharing/files/:memberId/:userId", fileSharingController.getFilesBetweenUsers);
router.post("/fileSharing/files/upload", fileSharingController.saveFile);
router.get("/fileSharing/folders/root/:id", middlewares.checkLogin, fileSharingController.checkRootFolder);
router.post("/fileSharing/folders/new", middlewares.checkLogin, fileSharingController.createNewFolder);
router.get("/fileSharing/folders/me/:id/:folderId/:type", fileSharingController.getMyFolders);
router.get("/fileSharing/files/me/:id/:folderId", fileSharingController.getMyFiles);
router.get("/fileSharing/folders/messages/:id/:folderId", middlewares.checkLogin, fileSharingController.checkMessagesFolder);
router.get("/fileSharing/folders/child/:id/:folderId/:folderType", middlewares.checkLogin, fileSharingController.getChildFolders);
router.get("/fileSharing/files/child/:id/:folderId", fileSharingController.getChildFiles);
router.get("/fileSharing/messagesData/:id", fileSharingController.getMessageFolderFiles);
router.get("/fileSharing/trash/:id", fileSharingController.getTrashData);
router.put("/fileSharing/restore", fileSharingController.restoreData);
router.put("/fileSharing/files/remove", fileSharingController.removeFile);
router.put("/fileSharing/folders/remove", fileSharingController.removeFolder);
router.get("/fileSharing/storage/:id", fileSharingController.getStorageUsed);
router.put("/fileSharing/rename", middlewares.checkLogin, fileSharingController.rename);
router.get("/fileSharing/sharedWithMe/:id", middlewares.checkLogin, fileSharingController.getSharedWithMeData);
router.get("/fileSharing/filesInGroup/:groupId", middlewares.checkLogin, fileSharingController.getFilesInGroup);
router.post("/fileSharing/shareData", fileSharingController.shareData);
router.put("/fileSharing/move", fileSharingController.move);
router.put("/fileSharing/folder/share", middlewares.checkLogin, fileSharingController.shareFolder);
router.put("/fileSharing/file/share", middlewares.checkLogin, fileSharingController.shareFile);
router.get("/fileSharing/folder/previous/:id", fileSharingController.getPreviousFolder);
router.get("/fileSharing/permissions/:privateSiteId/:isAdmin", fileSharingController.getFilePermissions);
router.put("/fileSharing/saveFileAccessSettings", middlewares.checkLogin, fileSharingController.saveFileAccessSettings);
router.put("/fileSharing/folder/update/parent", fileSharingController.updateParentFolder);
router.post("/fileSharing/folder/upload", middlewares.checkLogin, fileSharingController.uploadFolder);

// Groups routes
router.post("/groups/createGroup", groupsController.createGroup);
router.get("/groups/getGroups", groupsController.getGroups);
router.get("/groups/getMyGroups/:id/:siteId", groupsController.getMyGroups);
router.get("/groups/getMyPrivateGroups/:id/:siteId", groupsController.getMyPrivateGroups);
router.put("/groups/makeAdmin/:groupId", groupsController.makeAdmin);
router.put("/groups/removeAdmin/:groupId", groupsController.removeAdmin);
router.put("/groups/removeUserFromGroup/:groupId", groupsController.removeUserFromGroup);
router.put("/groups/addMembersToGroup/:groupId", groupsController.addMembersToGroup);
router.put("/groups/updateGroup", groupsController.updateGroup);

// Messages routes
router.post("/message/createMessage", messageController.createMessage);
router.post("/message/getPrivateSiteSubscribers", messageController.getPrivateSiteSubscribers);
router.post("/message/getOwner", messageController.getOwner);
router.post("/message/getOtherSubscribersForMessaging", messageController.getOtherSubscribersForMessaging);
router.put("/message/updateMessage/:id", messageController.updateMessage);
router.put("/message/updateBlock", messageController.updateBlock);
router.post("/message/forwardMessage", messageController.forwardMessage);
router.post("/message/userSubscription", messageController.userSubscription);
router.post("/message/sendMessageRequest", messageController.sendMessageRequest);
router.post("/message/acceptAutomaticMessageRequest", messageController.acceptAutomaticMessageRequest);
router.get('/message/getAllMessages', messageController.getAllMessages);
router.get("/message/getMessages/:id", messageController.getMessages);
router.post("/message/getMessageUsers", messageController.getMessageUsers);
router.post("/message/getMessageUsersBy", messageController.getMessageUsersBy);
router.put("/message/deleteGroupMessages", messageController.deleteGroupMessages);
router.put("/message/deleteMessage", messageController.deleteMessage);
router.put("/message/deleteGroup", messageController.deleteGroup);
router.get("/message/getMessagesBetweenMembers/:id/:userId", messageController.getMessagesBetweenMembers);
router.get("/message/getMessagesBetweenMembersInPrivateSite/:id/:userId/:siteId", messageController.getMessagesBetweenMembersInPrivateSite);
router.put("/message/leaveGroup", messageController.leaveGroup);
router.post("/message/searchMessages", messageController.searchMessages);
router.post("/message/getMessageRequestByCountry", messageController.getMessageRequestByCountry);
router.post("/message/getSentRequestByCountry", messageController.getSentRequestByCountry);
router.post("/message/getAllMessageRequest", messageController.getAllMessageRequest);
router.post("/message/getAllSentMessageRequest", messageController.getAllSentMessageRequest);
router.put("/message/updateMessageRequestStatus/:id", messageController.updateMessageRequestStatus);
router.post("/message/acceptMessageRequest", messageController.acceptMessageRequest);
router.put("/message/removeMessageSubscription", middlewares.checkLogin, messageController.removeMessageSubscription);
router.get("/message/getMessageSubscriptionStatus/:id/:userProfileId", messageController.getMessageSubscriptionStatus);
router.put("/message/removeMessaging", messageController.removeMessaging);

// User routes
router.post("/user/find", userController.find);
router.put("/user/youtubeSettingsOldUsers", userController.youtubeSettingsOldUsers);
router.put("/user/deactivate/:id", userController.deactivate);
router.put("/user/activate/:id", userController.activate);
router.get("/user/getusers", userController.getusers);
router.get("/user/getprivatesiteusers/:id", userController.getprivatesiteusers);
router.post("/user/getuserprofile", userController.getuserprofile);
router.get("/user/checkPrivateSiteName/:name", userController.checkPrivateSiteName);
router.post("/user/sendOtp", userController.sendOtp);
router.post("/user/sendOtpToSignUp", userController.sendOtpToSignUp);
router.post("/user/submitOtp", userController.submitOtp);
router.post("/user/deletePhoneNumber", middlewares.checkLogin, userController.deleteNumber);
router.get("/user/privatesite/:id", userController.getPrivateSiteSubscribersCount);
router.get("/user/getUserNames", userController.getUserNames)

// Notification routes
router.post('/notification/getallnotifications', notificationController.getallnotifications);
router.post('/notification/getsubscribernotifications', notificationController.getsubscribernotifications);
router.post('/notification/saveGroupNotifcation', notificationController.saveGroupNotifcation)
router.post('/notification/getallprivatenotifications', notificationController.getallprivatenotifications);
router.put('/notification/markasviewd', notificationController.markasviewd);
router.post('/notification/savenotifcation', notificationController.savenotifcation);
router.put('/notification/markasallviewd', notificationController.markasallviewd);
router.put('/notification/markasallread', notificationController.markasallread);

// Poll routes
router.post("/poll/createPoll", pollController.createPoll);
router.get("/poll/getmetadata", pollController.getmetadata);
router.put("/poll/updatepoll/:id", pollController.updatepoll);
router.get("/poll/getprivatepollinfobyid/:id", pollController.getprivatepollinfobyid);
router.get("/poll/getpollinfobyid/:id", pollController.getpollinfobyid);
router.post("/poll/getprofilepoll/", pollController.getprofilepoll);
router.post("/poll/getpolldetails", pollController.getpolldetails);
router.post("/poll/getprivatepolldetails", pollController.getprivatepolldetails);
router.post("/poll/getprivatesubscriberpolldetails", pollController.getprivatesubscriberpolldetails);
router.post("/poll/getprofilefeedpoll/", pollController.getprofilefeedpoll);
router.post("/poll/getprivateprofilfeedpoll/", pollController.getprivateprofilfeedpoll);
router.post("/poll/getprivateprofilefeedpollbycountry/", pollController.getprivateprofilefeedpollbycountry);
router.post("/poll/getpollinfo/", pollController.getrecentpollsbycountry);
router.post("/poll/gettoppolls/", pollController.gettoppolls);
router.post("/poll/gettrendingpolls/", pollController.gettrendingpolls);
router.post("/poll/gettoppollsbyworld/", pollController.gettoppollsbyworld);
router.post("/poll/gettrendingpollsbyworld/", pollController.gettrendingpollsbyworld);
router.post("/poll/getpollinfobyworld/", pollController.getrecentpollsbyworld);
router.get("/poll/search", pollController.getPollsForSearch);
router.put("/poll/deletepoll", pollController.deletepoll);
router.put("/poll/updatepollCastCountByAnswer/:id", pollController.updatepollCastCountByAnswer);
router.put("/poll/updateBoth/:id", pollController.updateBoth);
router.put("/poll/updatePollResult/:id", pollController.updatePollResult);
router.post("/poll/pollResult", pollController.pollResult);
router.put("/poll/voteByBoth/:id", pollController.voteByBoth);
router.put("/poll/votepollCastCountByAnswer/:id", pollController.votepollCastCountByAnswer);
router.put("/poll/followTopic", pollController.followTopic);
router.put("/poll/unfollowTopic", pollController.unfollowTopic);
router.put("/poll/flagTopic", pollController.flagTopic);
router.put("/poll/unflagTopic", pollController.unflagTopic);
router.post("/poll/getpollresultbyworld", pollController.getpollresultbyworld);
router.post("/poll/getprivatepollresultbyworld", pollController.getprivatepollresultbyworld);
router.post("/poll/retruthtopic", pollController.retruthtopic);
router.delete("/poll/retruthtopic/:id", pollController.removeRetruth);
router.put("/poll/addUserToRetruth", pollController.addUserToRetruth);
router.put("/poll/removeUserToRetruth", pollController.removeUserToRetruth);
router.post("/poll/getprofilefeedcount", pollController.getprofilefeedcount);
router.post("/poll/getprofilefeedcountbyworld", pollController.getprofilefeedcountbyworld);
router.post("/poll/searchPolls/", pollController.searchPolls);
router.post("/poll/getpollresult", pollController.getpollresult);
router.post("/poll/getprivatepollresult", pollController.getprivatepollresult);
router.post("/poll/getprivatesubscriberpollresult", pollController.getprivatesubscriberpollresult);
router.post("/poll/getprofilefeedpollbyworld/", pollController.getprofilefeedpollbyworld);
router.post("/poll/getownerfeedpollbyworld/", pollController.getownerfeedpollbyworld);
router.post('/poll/updatePollExpire', pollController.updatePollExpire);
router.get('/poll/ispolldeleted/:id', pollController.ispolldeleted);
router.put("/poll/deleteArticle", pollController.deleteArticle);
router.post("/poll/getprofiletopics/", pollController.getprofiletopics);
router.post("/poll/getprivatesubscriberprofiletopics/", pollController.getprivatesubscriberprofiletopics);
router.post("/poll/getprivatesubscriberownerprofiletopics/", pollController.getprivatesubscriberownerprofiletopics);
router.post("/poll/getprivatesubscriberprofiletopicsbyworld/", pollController.getprivatesubscriberprofiletopicsbyworld);
router.post("/poll/getprivatesubscriberownerprofiletopicsbyworld/", pollController.getprivatesubscriberownerprofiletopicsbyworld);
router.post("/poll/getprivateprofiletopics/", pollController.getprivateprofiletopics);
router.post("/poll/getprofiletopicsbyworld", pollController.getprofiletopicsbyworld);
router.post("/poll/getownerprofiletopicsbyworld", pollController.getownerprofiletopicsbyworld);
router.post("/poll/getprofiletopiccount", pollController.getprofiletopiccount);
router.post("/poll/getprofiletopiccountbyworld", pollController.getprofiletopiccountbyworld);
router.post("/poll/recentcount", pollController.recentcount);
router.post("/poll/topcount", pollController.topcount);
router.post("/poll/trendingcount", pollController.trendingcount);
router.post("/poll/recentcountbyworld", pollController.recentcountbyworld);
router.post("/poll/topcountbyworld", pollController.topcountbyworld);
router.post("/poll/trendingcountbyworld", pollController.trendingcountbyworld);
router.put('/poll/privateSitePoll', pollController.privateSitePoll);
router.put('/poll/updatePollToPrivate', pollController.updatePollToPrivate);
router.post('/poll/insertVerifiedVoter', middlewares.checkLogin, pollController.insertVerifiedVoter);
router.post('/poll/search/tag', pollController.searchTags);
router.post('/poll/tags', pollController.getTags);

// Private poll routes

router.post("/privatepoll/getrecentpolls", privatesitePollController.getrecentpolls);
router.post("/privatepoll/getrecentpollsbyworld", privatesitePollController.getrecentpollsbyworld);
router.post("/privatepoll/getsubscriberrecentpolls", privatesitePollController.getsubscriberrecentpolls);
router.post("/privatepoll/getsubscriberrecentpollsbyworld", privatesitePollController.getsubscriberrecentpollsbyworld);
router.post("/privatepoll/gettoppolls", privatesitePollController.gettoppolls);
router.post("/privatepoll/gettoppollsbyworld", privatesitePollController.gettoppollsbyworld);
router.post("/privatepoll/gettrendingpolls", privatesitePollController.gettrendingpolls);
router.post("/privatepoll/gettrendingpollsbyworld", privatesitePollController.gettrendingpollsbyworld);
router.post("/privatepoll/gettopcount", privatesitePollController.gettopcount);
router.post("/privatepoll/gettrendingcount", privatesitePollController.gettrendingcount);
router.post("/privatepoll/getrecentcount", privatesitePollController.getrecentcount);
router.get("/privatepoll/getpollinfo/:id", privatesitePollController.getpollinfo);
router.post("/privatepoll/gettopcountworld", privatesitePollController.gettopcountworld);
router.post("/privatepoll/gettrendingcountworld", privatesitePollController.gettopcountworld);
router.post("/privatepoll/getrecentcountworld", privatesitePollController.getrecentcountworld);

router.get("/privatepoll/recent", privatesitePollController.getallrecentpolls);
router.get("/privatepoll/top", privatesitePollController.getAllTopPolls);
router.get("/privatepoll/trending", privatesitePollController.getAllTrendingPolls);

// Signup routes
router.post('/signup/social', signupController.social);

// Profile routes
router.get("/profile/getPrivateProfile/:id", profileController.getPrivateProfile);
router.get("/profile/getProfile/:id", profileController.getProfile);
router.get("/profile/getPrivateSite/:id", profileController.getPrivateSite);
router.get('/profile/getUserProfileDetails/:id', profileController.getUserProfileDetails);
router.get('/profile/getVirtualUserProfileDetails/:id', profileController.getVirtualUserProfileDetails);
router.get('/profile/getPrivateSiteDetails/:id', profileController.getPrivateSiteDetails);
router.get('/profile/getPrivateSiteSettings/:id', profileController.getPrivateSiteSettings);
router.get('/profile/user/privateSites/:id', profileController.getAllPrivateSites);
router.put('/profile/savePrivateSiteSettings', profileController.savePrivateSiteSettings);
router.put('/profile/updatePrivateSiteSettings', profileController.updatePrivateSiteSettings);
router.get("/profile/getPollsterData/:id", profileController.getPollsterData);
router.put("/profile/updatePrivateSite", profileController.updatePrivateSite);
router.put("/profile/updateProfile", profileController.updateProfile);
router.put("/profile/makePrivateSiteAdmin", profileController.makeAdmin);
router.put("/profile/removePrivateSiteAdmin", profileController.removeAdmin);

// Retruth routes
router.post("/retruth/getretruthpolls", retruthController.getretruthpolls);

// Subscription routes
router.post("/subscription/userSubscription", subscriptionController.userSubscription);
router.post("/subscription/subscribers", subscriptionController.subscribers);
router.post("/subscription/getSubscriptionsByCountry", subscriptionController.getSubscriptionsByCountry);
router.post("/subscription/getAllSubscriptions", subscriptionController.getAllSubscriptions);
router.post("/subscription/getSubscribersByCountry", subscriptionController.getSubscribersByCountry);
router.post("/subscription/getPrivateSubscribersByCountry", subscriptionController.getPrivateSubscribersByCountry);
router.post("/subscription/getAllSubscribers", subscriptionController.getAllSubscribers);
router.post("/subscription/getPrivateSiteSubscribers", subscriptionController.getPrivateSiteSubscribers);
router.post("/subscription/getAllVirtualSubscribers", subscriptionController.getAllVirtualSubscribers);
router.put("/subscription/updateSubscrptionStatus/:id", subscriptionController.updateSubscrptionStatus);
router.put("/subscription/updateFeedOption/:id", subscriptionController.updateFeedOption);
router.post("/subscription/checkEmailInviteSubscriber/", subscriptionController.checkEmailInviteSubscriber);
router.post("/subscription/checkInviteSubscriber", subscriptionController.checkInviteSubscriber);
router.post("/subscription/sendSubscribeRequest", subscriptionController.sendSubscribeRequest);
router.post("/subscription/acceptsubcriber", subscriptionController.acceptsubcriber);
router.put("/subscription/acceptautomaticsubcriber/:id", subscriptionController.acceptautomaticsubcriber);
router.post("/subscription/sendSubscribeInvivatiions", subscriptionController.sendSubscribeInvivatiions);
router.post("/subscription/getUserProfileSubscrption", subscriptionController.getUserProfileSubscrption);
router.put("/subscription/removeSubscription", subscriptionController.removeSubscription);

// Private site routes
router.get("/privatesite/settings/:site", privateSitePollController.getSettings);
router.put("/privatesite/status", middlewares.checkLogin, privateSitePollController.changePrivatesiteStatus)

// Global configurations
router.get("/global/configurations", globalConfigurationsController.getConfigurations);

module.exports = router;
