const meetingService = require("../services/meetingService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");
const minutesService = require("../services/minutesService");
const fs = require("fs");
const { log } = require("console");
/**FUNC- TO CREATE MEETING**/
const createMeeting = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await meetingService.createMeeting(req.body, req.userId, ip);
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

// attendee availability check
const checkAttendeeAvailability = async (req, res) => {
  try{
    const result = await meetingService.checkAttendeeAvailability(
      req.body,
      req.params.id
    );
    if (result?.attendeeUnavailable) {
      const errMsg = messages.attendeeUnavailable + '(' + result.bookedTimeRange + ')';
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
    try{
      const result = await meetingService.checkAttendeeArrayAvailability(
        req.body
      );
      if (result?.attendeeUnavailable) {
        const errMsg = messages.attendeeUnavailable;
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
          null,
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
  
  // meeting room availability
  const checkMeetingRoomAvailability = async (req, res) => {
    try{
      const result = await meetingService.checkMeetingRoomAvailability(
        req.body
      );
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


const draftMeetingdelete = async (req, res) => {
  try {
    console.log("Request Data ");
    
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = meetingService.deleteDraftMeeting(
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
      messages.draftDeleted,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};






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
  notifyMeetingCreatorAboutDraft,
  getMeetingActionPriorityDetailsController,
  draftMeetingdelete
};
