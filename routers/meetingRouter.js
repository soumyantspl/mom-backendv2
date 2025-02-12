const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const meetingValidator = require("../validators/meetingValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const agendaController = require("../controllers/agendaController");
const zoomController = require("../controllers/zoomController");
/* CREATE MEETING  */
router.post(
  "/createMeeting",
  meetingValidator.createMeetingValidator,
  authMiddleware.verifyUserToken,
  authMiddleware.validateUserPermission,
  meetingController.createMeeting
);
/*UPDATE RSVP */
router.put(
  "/updateRsvp/:id",
  meetingValidator.updateRsvpValidator,
  authMiddleware.verifyUserToken,
  // authMiddleware.validateUserPermission,
  meetingController.updateRsvp
);
/*UPDATE RSVP BY EMAIL */
router.put(
  "/updateRsvpByEmail/:id",
  meetingValidator.updateRsvpByEmailValidator,
  meetingController.updateRsvpByEmail
);
/* CANCEL MEETING */
router.put(
  "/cancelMeeting/:id",
  meetingValidator.cancelMeetingValidator,
  authMiddleware.verifyUserToken,
  meetingController.cancelMeeting
);
/* UPDATE MEETING  */
router.put(
  "/updateMeeting/:id",
  meetingValidator.updateMeetingValidator,
  authMiddleware.verifyUserToken,
  meetingController.updateMeeting
);
/* VIEW SINGLE MEETING  */
router.get(
  "/viewMeeting/:id",
  meetingValidator.viewMeetingValidator,
  authMiddleware.verifyUserToken,
  meetingController.viewMeeting
);
/* VIEW ALL MEETINGS  */
router.post(
  "/viewAllMeetings",
  meetingValidator.viewAllMeetingsValidator,
  authMiddleware.verifyUserToken,
  authMiddleware.validateUserPermission,
  meetingController.viewAllMeetings
);
/* LIST ATTENDEES FROM PREVIOOUS MEETING */
router.get(
  "/listAttendeesFromPreviousMeeting/:organizationId",
  meetingValidator.listAttendeesFromPreviousMeetingValidator,
  authMiddleware.verifyUserToken,
  meetingController.listAttendeesFromPreviousMeeting
);
/* VIEW SINGLE MEETING ALL AGENDA WITH MINUTES  */
router.get(
  "/viewMeetingAgendaWithMinutes/:id",
  meetingValidator.viewMeetingValidator,
  authMiddleware.verifyUserToken,
  agendaController.viewAgendas
);
/* VIEW MEETING ACTIVITIES LIST   */
router.get(
  "/viewMeetingActivities/:id",
  meetingValidator.meetingActivitieslist,
  authMiddleware.verifyUserToken,
  meetingController.viewMeetingActivities
);
/* GET MEETING CREATE STEP STATUS  */
router.get(
  "/getCreateMeetingStep/:organizationId",
  meetingValidator.getCreateMeetingStep,
  authMiddleware.verifyUserToken,
  meetingController.getCreateMeetingStep
);
/* UPDATE MEETING  */
router.put(
  "/updateMeetingAttendance/:id",
  meetingValidator.updateMeetingAttendanceValidator,
  authMiddleware.verifyUserToken,
  meetingController.updateMeetingAttendance
);
/* RESCHEDULE MEETING  */
router.put(
  "/rescheduleMeeting/:id",
  meetingValidator.rescheduleMeetingValidator,
  authMiddleware.verifyUserToken,
  meetingController.rescheduleMeeting
);
/* UPDATE MEETING  */
router.put(
  "/generateMOM/:meetingId",
  meetingValidator.generateMOMValidator,
  authMiddleware.verifyUserToken,
  meetingController.generateMOM
);
/*DOWNLOAD MOM  */
router.get(
  "/downloadMOM/:meetingId",
  meetingValidator.downloadMomValidator,
  authMiddleware.verifyUserToken,
  meetingController.downloadMOM
);
/*GIVE MOM WRITE PERMISIION */
router.put(
  "/giveMomWritePermission/:meetingId",
  meetingValidator.giveMomWritePermissionValidator,
  authMiddleware.verifyUserToken,
  meetingController.giveMomWritePermission
);
/*GET FOLLOW ON MEETING LIST */
router.get(
  "/getTimelineList/:meetingId",
  meetingValidator.getTimelineListValidator,
  authMiddleware.verifyUserToken,
  meetingController.getTimelineList
);
/* UPDATE MEETING  */
router.put(
  "/updateMeetingStatus/:meetingId",
  meetingValidator.updateMeetingStatusValidator,
  authMiddleware.verifyUserToken,
  meetingController.updateMeetingStatus
);
/*GET FOLLOW ON MEETING LIST */
router.get(
  "/viewParentMeeting/:meetingId",
  meetingValidator.viewParentMeeting,
  authMiddleware.verifyUserToken,
  meetingController.viewParentMeeting
);
/*GET FOLLOW ON MEETING LIST */
router.get(
  "/viewMeetingStatistics/:organizationId",
  meetingValidator.meetingStatisticsValidator,
  authMiddleware.verifyUserToken,
  meetingController.viewMeetingStatistics
);
/*GET MEETING WITH ORGANIZATION DETAILS FOR UPDATE RSVP */
router.post(
  "/viewMeetingDetailsForRsvp",
  meetingValidator.viewMeetingDetailsForRsvpValidator,
  meetingController.viewMeetingDetailsForRsvp
);
/* ACCEPT ALL PENDING MOM */
router.get("/sendAlertTime", meetingController.sendAlertTime);
/*GET MEETING DETAILS TO SINGLE/ALL ATTENDEES WITH LATEST RSVP STATUS */
router.post(
  "/sendMeetingDetails",
  meetingValidator.sendMeetingDetailsValidator,
  authMiddleware.verifyUserToken,
  meetingController.sendMeetingDetails
);
router.post(
  // "/fetchCurrentAttendeesList/:organizationId",
  "/fetchCurrentAttendeesList",
  meetingValidator.fetchCurrentAttendeesListValidator,
  authMiddleware.verifyUserToken,
  meetingController.fetchCurrentAttendeesList
);

router.post(
  // "/fetchCurrentAttendeesList/:organizationId",
  "/createZoomMeeting",
  // meetingValidator.fetchCurrentAttendeesListValidator,
  // authMiddleware.verifyUserToken,
  zoomController.createMeeting
);

/* GET ALL RECORDING OF A MEETING */
router.get(
  "/getRecordingsZoomMeetingForMOM/:meetingId",
  meetingController.getRecordingsZoomMeetingForMOM
);

/* RESCHEDULE AND CREATE A NEW MEETING  */
router.put(
  "/newMeetingAsRescheduled/:id",
  meetingValidator.newMeetingAsRescheduledValidator,
  authMiddleware.verifyUserToken,
  meetingController.newMeetingAsRescheduled
);

/* VIEW MEETING ALL STATUS DATA   */
router.get(
  "/totalMeetingListForChart/:organizationId",
  meetingValidator.totalMeetingListForChartValidator,
  authMiddleware.verifyUserToken,
  meetingController.totalMeetingListForChart
);



/* VIEW SINGLE MEETING  */
router.post(
  "/getMeetingActionPriotityDetails",
  meetingValidator.getMeetingActionPriotityDetailsValidator,
  authMiddleware.verifyUserToken,
  meetingController.getMeetingActionPriotityDetails
);


/* DELETE ZOOM RECORDING  */
router.post(
  "/deleteZoomRecording",
  meetingValidator.deleteZoomRecordingValidator,
  authMiddleware.verifyUserToken,
  meetingController.deleteZoomRecording
);


/* DOWNLOAD ALL ZOOM RECORDING  */
router.post(
  "/downloadZoomRecordingsInZip",
  meetingValidator.downloadZoomRecordingsInZipValidaor,
  authMiddleware.verifyUserToken,
  meetingController.downloadZoomRecordingsInZip
);



/* DOWNLOAD ALL ZOOM RECORDING  */
router.post(
  "/createGMeeting",
  meetingController.createGMeeting
);


module.exports = router;
