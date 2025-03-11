const meetingService = require("../services/meetingService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");
const minutesService = require("../services/minutesService");
const fs = require("fs");
const Meetings = require("../models/meetingModel");
const ObjectId = require("mongoose").Types.ObjectId;
const { log } = require("console");
/**FUNC- TO CREATE MEETING**/
const createMeeting = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await meetingService.createMeeting(req.body, req.userId, ip);
    console.log(result)
    if (result?.inActiveOrganization) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.inActiveOrganization,
        200
      );
    }
    if (result?.organizerUnavailable) {
      const errMsg = messages.organizerUnavailable + result.bookedTimeRange;
      console.log(errMsg)
      return Responses.failResponse(
        req,
        res,
        null,
        errMsg,
        200
      );
    }
    if (result?.isDuplicateEmail) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEmail,
        200
      );
    }
    if (result?.isDuplicateEmpCode) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEmpCode,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.createdSuccess,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO UPDATE RSVP DATA**/
const updateRsvp = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await meetingService.updateRsvp(
      req.params.id,
      req.userId,
      req.body,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.updateSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO UPDATE MEETING**/
const updateMeeting = async (req, res) => {
  try {

    let meetingresult
    let attendeeArrayBody
    if (!req.body.date && !req.body.fromTime && !req.body.toTime){
      console.log("innnnnnnnnnnnnnnnnnnnnn11111111")
      const getMeetingById = await Meetings.findOne(
        { _id: new ObjectId(req.params.id) },
        { 
          _id: 1, 
          date: 1, 
          organizationId: 1,
          fromTime: 1, 
          toTime: 1, 
          attendees: 1, 
          meetingStatus: 1, 
          organizationId: 1, 
          "locationDetails.roomId": 1
        }
      );
      const requestBodyRoom = {
        date: getMeetingById.date,
        organizationId: getMeetingById.organizationId,
        fromTime: getMeetingById.fromTime,
        toTime: getMeetingById.toTime,
        roomId: getMeetingById.locationDetails?.roomId,
        meetingStatus: getMeetingById.meetingStatus,
        meetingId:req.params.id
      };
      attendeeArrayBody = {
        date: req.body.step?req.body.step:getMeetingById.date,
        fromTime: req.body.step?req.body.step:getMeetingById.fromTime,
        toTime: req.body.step?req.body.step:getMeetingById.toTime,
        meetingStatus: getMeetingById.meetingStatus,
        meetingId:req.params.id,
        organizationId: getMeetingById.organizationId,
      };
      // await checkMeetingRoomAvailability({
      //       ...data,
      //       _id: { $ne: data?.meetingId },
      //     });
      console.log("requestBodyRoom======================2222",requestBodyRoom)
      meetingresult = await meetingService.checkMeetingRoomAvailability(
        requestBodyRoom
      );
if(!req.body.attendees){
  attendeeArrayBody.attendees=getMeetingById?.attendees
}
      const attendeeMergedBody = { ...req.body, ...attendeeArrayBody };
      const attendeearrayresult = await meetingService.checkAttendeeArrayAvailability(attendeeMergedBody);
      if (attendeearrayresult.length > 0){
        const busyMessages = attendeearrayresult.map((attendee) => {
          const meetingDetails = attendee.meetings
            .map(
              (meeting) =>
                `(Meeting ID: ${meeting.meetingId}) from ${meeting.fromTime} to ${meeting.toTime}`
            )
            .join(", ");
    if(req.body.step==1){
        const errMsg = messages.organizerUnavailable +`from ${meeting.fromTime} to ${meeting.toTime} of meeting ${meeting?.meetingId}`;
      return errMsg;
    }
    else{
      return `${attendee.name} is unavailable due to another meeting: ${meetingDetails}`;
    }
          
        });
        return Responses.failResponse(req, res, attendeearrayresult, busyMessages, 200);
      }

    } else {
      console.log("innnnnnnnnnnnnnnnnnnnnn222222222222222")
      const getMeetingById = await Meetings.findOne(
        { _id: new ObjectId(req.params.id) },
        { 
          _id: 1, 
          date: 1, 
          organizationId: 1,
          fromTime: 1, 
          toTime: 1, 
          attendees: 1, 
          meetingStatus: 1, 
          organizationId: 1, 
          "locationDetails.roomId": 1
        }
      );
      const roomCheckBody = {
        meetingStatus: getMeetingById.meetingStatus,
        meetingId:req.params.id,
      };
    
      const mergedBody = { ...req.body, ...roomCheckBody };
      meetingresult = await meetingService.checkMeetingRoomAvailability(
        mergedBody
      );
      attendeeArrayBody = {
        date: req.body.step?req.body.step:getMeetingById.date,
        fromTime: req.body.step?req.body.step:getMeetingById.fromTime,
        toTime: req.body.step?req.body.step:getMeetingById.toTime,
        meetingStatus: getMeetingById.meetingStatus,
        meetingId:req.params.id,
        organizationId: getMeetingById.organizationId
      };
      if(!req.body.attendees){
        attendeeArrayBody.attendees=getMeetingById?.attendees
      }
      const attendeeMergedBody = { ...req.body, ...attendeeArrayBody };
      const attendeearrayresult = await meetingService.checkAttendeeArrayAvailability(attendeeMergedBody);
      if (attendeearrayresult.length > 0){
        const busyMessages = attendeearrayresult.map((attendee) => {
          const meetingDetails = attendee.meetings
            .map(
              (meeting) =>
                `(Meeting ID: ${meeting.meetingId}) from ${meeting.fromTime} to ${meeting.toTime}`
            )
            .join(", ");
    
          return `${attendee.name} is unavailable due to another meeting: ${meetingDetails}`;
        });
        return Responses.failResponse(req, res, attendeearrayresult, busyMessages, 200);
      }
    }
console.log("meetingresult=======================",meetingresult)
    if (meetingresult?.roomUnavailable) {
      const errMsg = messages.roomUnavailable + '(' + meetingresult.bookedTimeRange + ')';
      return Responses.failResponse(
      req,
      res,
      null,
      errMsg,
      200
    );
    }



    if (req.body.isEditMeeting) {
      const checkCanUpdateMeeting = await minutesService.checkCanUpdateMeeting(
        req.params.id,
        req.body.organizationId
      );
      console.log("checkCanUpdateMeeting-----------", checkCanUpdateMeeting);
      if (!checkCanUpdateMeeting) {
        return Responses.failResponse(
          req,
          res,
          null,
          messages.meetingEditDenied,
          200
        );
      }
    }
  
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.updateMeeting(
      req.body,
      req.params.id,
      req.userId,
      req.userData,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    if (req.body.step === 3) {
      req.app
        .get("io")
        .emit("notification", "calling from backend controller ");
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.updateSuccess,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO CANCEL MEETING**/
const cancelMeeting = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = meetingService.cancelMeeting(
      req.params.id,
      req.userId,
      req.body,
      ip
    );
    if (!result) {
      return Responses.failResponse(req, res, null, messages.cancelFailed, 409);
    }
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.canceled,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW ALL MEETING DETAILS**/
const viewAllMeetings = async (req, res) => {
  try {
    const result = await meetingService.viewAllMeetings(
      req.body,
      req.query,
      req.userId,
      req.userData
    );
    if (result.totalCount == 0) {
      return Responses.failResponse(
        req,
        res,
        {
          totalCount: 0,
          meetingData: [],
        },
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW SINGLE MEETING DETAILS**/
const viewMeeting = async (req, res) => {
  try {
    const result = await meetingService.viewMeeting(req.params.id, req.userId);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW LIST ATTENDEES FROM PREVIOUS MEETING**/
const listAttendeesFromPreviousMeeting = async (req, res) => {
  try {
    const result = await meetingService.listAttendeesFromPreviousMeeting(
      req.params.organizationId,
      req.userId
    );
    if (result.length == 0) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW LIST ATTENDEES FROM PREVIOUS MEETING**/
const viewMeetingActivities = async (req, res) => {
  try {
    const result = await meetingService.viewMeetingActivities(req.params.id);
    if (result.length == 0) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/* GET MEETING CREATE STEP STATUS  */
const getCreateMeetingStep = async (req, res) => {
  try {
    const result = await meetingService.getCreateMeetingStep(
      req.params.organizationId,
      req.userId
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO UPDATE MEETING ATTENDANCE**/
const updateMeetingAttendance = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.updateMeetingAttendance(
      req.params.id,
      req.userId,
      req.body,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.updateAttendanceSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO GENERATE MOM **/
const generateMOM = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.generateMOM(
      req.params.meetingId,
      req.userId,
      req.body,
      ip
    );
    if (result.isAttendanceAdded == false) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.pleaseAddAttendance,
        200
      );
    }
    if (result.isMinuteAdded == false) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.pleaseAddMinute,
        200
      );
    }
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.momGeneratedSuccessfully,
      200
    );
    console.log(result);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="example.pdf"');
    const fileStream = fs.createReadStream(result);
    fileStream.pipe(res);
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO DOWNLOAD MOM **/
const downloadMOM = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.downloadMOM(
      req.params.meetingId,
      req.userId,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.MOMDownloadedSuccessfully,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO RESCHEDULE MEETING**/
const rescheduleMeeting = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.rescheduleMeeting(
      req.params.id,
      req.userId,
      req.body,
      req.userData,
      ip
    );
    console.log('Result inside rescheduleMeeting----', result)
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    if (result?.roomUnavailable) {
      const errMsg = messages.roomUnavailable + '(' + result.bookedTimeRange + ')';
      return Responses.failResponse(req, res, null, errMsg, 200);
    }
    if (result?.attendeesUnavailable) {
    
      const busyMessages = result.attendeeAvailability.map((attendee) => {
        const meetingDetails = attendee.meetings
          .map(
            (meeting) =>
              `(Meeting ID: ${meeting.meetingId}) from ${meeting.fromTime} to ${meeting.toTime}`
          )
          .join(", "); 
    
        return `${attendee.name} is unavailable due to another meeting: ${meetingDetails}`;
      });
    
      return Responses.failResponse(req, res, null, busyMessages, 200);
    }
    
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.rescheduledSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO GIVE MOM WRITE PERMISSION**/
const giveMomWritePermission = async (req, res) => {
  try {
    console.log("Updated User--->>>");

    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.giveMomWritePermission(
      req.params.meetingId,
      req.userId,
      req.body,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.updateSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- GET TIME LINE LIST **/
const getTimelineList = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.getTimelineList(
      req.params.meetingId,
      req.userId,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        result,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- UPDATE MEETING STATUS **/
const updateMeetingStatus = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.updateMeetingStatus(
      req.params.meetingId,
      req.userId,
      req.body,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        result,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.updateSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW PARENT MEETING DETAILS**/
const viewParentMeeting = async (req, res) => {
  try {
    const result = await meetingService.viewParentAgendas(
      req.params.meetingId,
      req.userId
    );
    if (result?.length == 0) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW  MEETING STATISTICS DETAILS**/
const viewMeetingStatistics = async (req, res) => {
  try {
    const result = await meetingService.viewMeetingStatistics(
      req.params.organizationId,
      req.userId,
      req.userData
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW  MEETING DETAILS FOR RSVP **/
const viewMeetingDetailsForRsvp = async (req, res) => {
  try {
    const result = await meetingService.viewMeetingDetailsForRsvp(
      req.body.meetingId,
      req.body.userId
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO UPDATE RSVP DATA BY EMAIL**/
const updateRsvpByEmail = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.updateRsvpByEmail(
      req.params.id,
      req.body.userId,
      req.body,
      req.userData,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.updateSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO SEND ALERT TIME**/
const sendAlertTime = async (req, res) => {
  try {
    const result = await meetingService.sendAlertTime();
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.updateSuccess,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO SEND MEETING DETAILS**/
const sendMeetingDetails = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.sendMeetingDetails(
      req.userId,
      req.body,
      req.userData,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.resendMeetingDetails,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW LIST ATTENDEES FROM PARENT MEETING**/
const fetchCurrentAttendeesList = async (req, res) => {
  try {
    console.log(req.body);
    const result = await meetingService.fetchCurrentAttendeesList(
      req.body.organizationId,
      req.body.parentMeetingId
    );
    if (result.length == 0) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO VIEW LIST OF ZOOM RECORDING OF A MEETING**/
const getRecordingsZoomMeetingForMOM = async (req, res) => {
  try {
    //console.log(req.body);
    const result = await meetingService.getRecordingsZoomMeetingForMOM(
      req.params.meetingId
    );
    console.log("result1", result);

    if (result.success) {
      console.log("Result:", result.data || result.message);
      return Responses.successResponse(
        req,
        res,
        result.data,
        messages.recordsFound,
        200
      );
    } else {
      console.error("Error:", result.message);
      return Responses.failResponse(req, res, null, result.message, 200);
    }
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO CREATE A NEW MEETING FROM SCEDULED MEETING**/
const newMeetingAsRescheduled = async (req, res) => {
  try {
    console.log(req.body);
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await meetingService.newMeetingAsRescheduled(
      req.params.id,
      req.body,
      req.userId,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    if (result?.inActiveOrganization) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.inActiveOrganization,
        200
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.createdSuccess,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW ALL MEETING STATUS REPORT **/
const totalMeetingListForChart = async (req, res) => {
  try {
    const result = await meetingService.totalMeetingListForChart(
      req.params.organizationId,
      req.userId,
      req.userData
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO VIEW  MEETING STATISTICS DETAILS**/
const getMeetingActionPriotityDetails = async (req, res) => {
  try {
    const result = await meetingService.getMeetingActionPriotityDetails(
      req.query,
      req.body,
      req.userId,
      req.userData
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO DELETE MEETING RECORDINGS ZOOM**/
const deleteZoomRecording = async (req, res) => {
  try {
    const result = await meetingService.deleteZoomRecording(
      req.body,
      req.userId
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.deleteFailedRecordNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.deleteSuccess,
      202
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);

    if (error?.response?.status == 404) {
      return Responses.failResponse(
        req,
        res,
        null,
        error?.response?.data.message,
        200
      );
    } else {
      return Responses.errorResponse(req, res, error);
    }
  }
};
/**FUNC- TO DOWNLAD ALL MEETING RECORDINGS ZOOM**/
const downloadZoomRecordingsInZip = async (req, res) => {
  try {
    const result = await meetingService.downloadZoomRecordingsInZip(
      req.body,
      req.userId
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.deleteFailedRecordNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordingsDownloadedSuccessfully,
      202
    );

    // // Set headers for file download
    // res.setHeader("Content-Type", "application/zip");
    // res.setHeader(
    //   "Content-Disposition",
    //   'attachment; filename="Recordings.zip"'
    // );

    // // Send the ZIP file as a response
    // res.send(result);
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);

    return Responses.errorResponse(req, res, error);
  }
};

const getMeetingActionPriorityDetailsController = async (req, res) => {
  try {
    const result = await meetingService.getMeetingActionPriorityDetailsforChart(
      req.query,
      req.body,
      req.userId,
      req.userData
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const notifyMeetingCreatorAboutDraft = async (req, res) => {
  console.log("Processing draft meeting notification...");

  try {
    const result = await meetingService.notifyMeetingCreatorAboutDraft();

    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }

    return Responses.successResponse(
      req,
      res,
      result,
      messages.notificationSent,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const deleteDraftMeeting = async (req, res) => {
  console.log("Processing draft meeting notification...");

  try {
    const { meetingId } = req.params;
    const result = await meetingService.deleteOldDraftMeetings(meetingId);

    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }

    return Responses.successResponse(
      req,
      res,
      result,
      messages.deleteSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const draftMeetingdelete = async (req, res) => {
  try {
    // console.log("Request Data:", req.params.meetingId);

    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await meetingService.deleteDraftMeeting(
      req.params.meetingId,
      req.userId,
      req.body,
      ip
    );

    if (!result) {
      return Responses.failResponse(req, res, null, messages.draftFailed, 409);
    }

    return Responses.successResponse(
      req,
      res,
      result,
      messages.draftDeleted,
      200
    );
  } catch (error) {
    console.error("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

// attendee availability check
const checkAttendeeAvailability = async (req, res) => {
  try{
    const result = await meetingService.checkAttendeeAvailability(
      req.body,
      req.params.id
    );
    if (result?.attendeeUnavailable) {
      const errMsg = `${messages.attendeeUnavailable} ( Meeting ID: ${result.meetingId}) on the same date and time (${result.bookedTimeRange})`;
      // const errMsg = messages.attendeeUnavailable + '(' + result.bookedTimeRange + ')';
      return Responses.failResponse(
        req,
        res,
        null,
        errMsg,
        200
      );
    } 
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        { isScheduleUser: false },
        messages.recordsNotFound,
        200
      );
    }
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
  }

/// check attendee array availability
const checkAttendeeArrayAvailability = async (req, res) => {
  try {
    const result = await meetingService.checkAttendeeArrayAvailability(req.body);

    if (!result || result.length === 0) {
      return Responses.successResponse(req, res, null, messages.recordsNotFound, 200);
    }
    const busyMessages = result.map((attendee) => {
      const meetingDetails = attendee.meetings
        .map(
          (meeting) =>
            `(Meeting ID: ${meeting.meetingId}) from ${meeting.fromTime} to ${meeting.toTime}`
        )
        .join(", ");

      return `${attendee.name} is unavailable due to another meeting: ${meetingDetails}`;
    });

    return Responses.failResponse(req, res, result, busyMessages, 200);
  } catch (error) {
    console.error("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

  // meeting room availability
  const checkMeetingRoomAvailability = async (req, res) => {
    try{
      const result = await meetingService.checkMeetingRoomAvailability(
        req.body
      );
      if (!result) {
        return Responses.successResponse(req, res, null, messages.recordsNotFound, 200);
      
    }
      if (result?.roomUnavailable) {
        const errMsg = messages.roomUnavailable + '(' + result.bookedTimeRange + ')';
        return Responses.failResponse(
        req,
        res,
        null,
        errMsg,
        200
      );
        }  
      } catch (error) {
        console.log("Controller error:", error);
        errorLog(error);
        return Responses.errorResponse(req, res, error);
      }
      }

module.exports = {
  createMeeting,
  updateRsvp,
  cancelMeeting,
  updateMeeting,
  viewMeeting,
  viewAllMeetings,
  listAttendeesFromPreviousMeeting,
  viewMeetingActivities,
  getCreateMeetingStep,
  updateMeetingAttendance,
  generateMOM,
  downloadMOM,
  rescheduleMeeting,
  giveMomWritePermission,
  getTimelineList,
  updateMeetingStatus,
  viewParentMeeting,
  viewMeetingStatistics,
  viewMeetingDetailsForRsvp,
  updateRsvpByEmail,
  sendAlertTime,
  sendMeetingDetails,
  fetchCurrentAttendeesList,
  getRecordingsZoomMeetingForMOM,
  newMeetingAsRescheduled,
  totalMeetingListForChart,
  getMeetingActionPriotityDetails,
  deleteZoomRecording,
  downloadZoomRecordingsInZip,
  checkAttendeeAvailability,
  checkMeetingRoomAvailability,
  checkAttendeeArrayAvailability,
  deleteDraftMeeting,
  draftMeetingdelete,
  notifyMeetingCreatorAboutDraft,
  getMeetingActionPriorityDetailsController,
  draftMeetingdelete,
};
