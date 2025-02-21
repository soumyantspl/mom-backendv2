const express = require("express");
const router = express.Router();
const minutesController = require("../controllers/minutesController");
const validator = require("../validators/minutesValidator");
const authMiddleware = require("../middlewares/authMiddleware");

/* MEETING MINUTE  */
router.put(
  "/acceptOrRejectMinutes/:minuteId",
  validator.acceptOrRejectMinutesValidator,
  authMiddleware.verifyUserToken,
  minutesController.acceptRejectMinutes
);
/*CREATE MINUTE */
router.post(
  "/createMinutes",
  validator.createMinutesValidator,
  authMiddleware.verifyUserToken,
  minutesController.createMinutes
);
/*DOWNLOAD MINUTE */
router.get(
  "/downloadMinutes/:meetingId",
  validator.downloadMinutesValidator,
  minutesController.downloadMinutes
);
/* CREATE MINUTE AMENDMENT REQUEST  */
router.put(
  "/createAmendmentRequest/:minuteId",
  validator.createAmendmentRequestValidator,
  authMiddleware.verifyUserToken,
  minutesController.createAmendmentRequest
);
/* CREATE MINUTE AMENDMENT REQUEST  */
router.put(
  "/updateAmendmentRequest/:minuteId",
  validator.updateAmendmentRequestValidator,
  authMiddleware.verifyUserToken,
  minutesController.updateAmendmentRequest
);
//FUNCTION TO GET ONLY MEETING LIST OF ATTENDEES
router.get(
  "/getMeetingListOfAttendees/:organizationId",
  validator.getMeetingListOfAttendeesValidator,
  authMiddleware.verifyUserToken,
  minutesController.getMeetingListOfAttendees
);
/* DELETE MINUTE */
router.put(
  "/deleteMinute/:minuteId",
  validator.deleteMinuteValidator,
  authMiddleware.verifyUserToken,
  minutesController.deleteMinute
);
/* UPDATE MINUTE */
router.put(
  "/updateMinute/:minuteId",
  validator.updateMinuteValidator,
  authMiddleware.verifyUserToken,
  minutesController.updateMinute
);
/* ACCEPT ALL PENDING MOM */
router.post("/acceptAllPendingMoms", minutesController.acceptAllPendingMoms);
/* ACCEPT ALL MINUTES */
router.put(
  "/acceptMinutes/:meetingId",
  validator.acceptMinutes,
  authMiddleware.verifyUserToken,
  minutesController.acceptMinutes
);
/*GET FOLLOW ON MEETING LIST */
router.get(
  "/getMomAcceptDetails/:meetingId",
  validator.getMomAcceptDetailsValidator,
  authMiddleware.verifyUserToken,
  minutesController.getMomAcceptDetails
);
/* ACCEPT ALL PENDING MOM */
router.get("/generateMinutesPdftest", minutesController.generateMinutesPdftest);

module.exports = router;
