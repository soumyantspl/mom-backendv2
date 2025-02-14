const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationController");
const validator = require("../validators/notificationValidator");
const authMiddleware = require("../middlewares/authMiddleware");

/* CREATE Notification  */
router.post(
  "/createNotification",
  validator.createNotificationValidator,
  authMiddleware.verifyUserToken,
  NotificationController.createNotification
);
/* EDIT Notification  */
router.put(
  "/editNotification/:id",
  validator.editNotificationValidator,
  authMiddleware.verifyUserToken,
  NotificationController.editNotification
);
/* VIEW NotificationS  */
router.post(
  "/viewNotifications",
  validator.viewNotificationValidator,
  authMiddleware.verifyUserToken,
  NotificationController.viewNotification
);
/* DELETE NotificationS  */
router.delete(
  "/deleteNotification/:id",
  validator.deleteNotificationValidator,
  authMiddleware.verifyUserToken,
  NotificationController.deleteNotification
);

module.exports = router;
