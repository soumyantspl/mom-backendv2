const minutesService = require("../services/minutesService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");
const meetingService = require("../services/meetingService");

const acceptRejectMinutes = async (req, res) => {
  try {
    const result = await minutesService.acceptRejectMinutes(
      req.body,
      req.params.minuteId,
      req.userId
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        409
      );
    }
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.updateSuccess,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const createMinutes = async (req, res) => {
  try {
    if (req?.userData?.isAdmin === false) {
      const isMeetingOrganiser = await meetingService.getCreatedByDetails(req.body.meetingId, req.userId);
      if (isMeetingOrganiser === false) {
        const checkMomWritePermission =
          await minutesService.checkMomWritePermission(
            req.body.meetingId,
            req.userId
          );

        if (!checkMomWritePermission) {
          return Responses.failResponse(
            req,
            res,
            null,
            messages.momWritePermissionDenied,
            200
          );
        }
      }
    }
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await minutesService.createMinutes(
      req.body.minutes,
      req.body.meetingId,
      req.userId,
      req.userData,
      ip
    );
    if (result.isWriteMinuteNotAllowedForClosedMinutes) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.writeMinuteNotAllowed,
        200
      );
    }
    if (!result) {
      return Responses.failResponse(req, res, null, messages.createError, 200);
    }
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.createdSuccess,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const downloadMinutes = async (req, res) => {
  try {
    const result = await minutesService.downLoadMinutes(
      req.params.meetingId,
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
    return Responses.successDownloadResponse(
      req,
      res,
      result,
      messages.momGeneratedSuccessfully,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const createAmendmentRequest = async (req, res) => {
  try {
    const result = await minutesService.createAmendmentRequest(
      req.body,
      req.params.minuteId,
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
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.createdSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const updateAmendmentRequest = async (req, res) => {
  try {
    const result = await minutesService.updateAmendmentRequest(
      req.body,
      req.params.minuteId,
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
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/* GET MEETING CREATE STEP STATUS  */
const getMeetingListOfAttendees = async (req, res) => {
  try {
    const result = await minutesService.getMeetingListOfAttendees(
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

/* DELETE MEETING  */
const deleteMinute = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    if (!req?.userData?.isAdmin) {
      const isMeetingOrganiser = await meetingService.getCreatedByDetails(req.body.meetingId, req.userId);
      if (isMeetingOrganiser === false) {
        const checkMomWritePermission =
          await minutesService.checkMomWritePermission(
            req.body.meetingId,
            req.userId
          );
        if (!checkMomWritePermission) {
          return Responses.failResponse(
            req,
            res,
            null,
            messages.momWritePermissionDenied,
            200
          );
        }
      }
    }
    const result = await minutesService.deleteMinute(
      req.body.meetingId,
      req.params.minuteId,
      req.userId,
      ip
    );
    if (result.isDeleteNotAllowed) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.deleteFailedNotAllowed,
        200
      );
    }
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
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const updateMinute = async (req, res) => {
  try {
    console.log(req.body)
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    if (!req?.userData?.isAdmin) {

      const isMeetingOrganiser = await meetingService.getCreatedByDetails(req.body.meetingId, req.userId);
      if (isMeetingOrganiser === false) {

        const checkMomWritePermission =
          await minutesService.checkMomWritePermission(
            req.body.meetingId,
            req.userId
          );

        if (!checkMomWritePermission) {
          return Responses.failResponse(
            req,
            res,
            null,
            messages.momWritePermissionDenied,
            200
          );
        }
      }
    }
    const result = await minutesService.updateMinute(
      req.body,
      req.params.minuteId,
      req.userId,
      req.userData,
      ip
    );
    if (result.isWriteMinuteNotAllowedForClosedMinutes) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.editMinuteNotAllowed,
        200
      );
    }
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        409
      );
    }
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.updateSuccess,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const acceptMinutes = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await minutesService.acceptMinutes(
      req.body,
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
        409
      );
    }
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.updateSuccess,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW  MEETING MOM ACCEPTED BY ATTENDEES DETAILS**/
const getMomAcceptDetails = async (req, res) => {
  try {
    const result = await minutesService.getMomAcceptDetails(
      req.params.meetingId,
      req.userId
    );
    if (result.length == 0) {
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
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW  MEETING MOM ACCEPTED BY ATTENDEES DETAILS**/
const generateMinutesPdftest = async (req, res) => {
  try {
    const result = await minutesService.generateMinutesPdftest(
      "66b360a1d19ad6ff8cc8559e",
      "6655d2b68ba49b304f0d8256"
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
    return Responses.successDownloadResponse(
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

const acceptAllPendingMoms = async (req, res) => {
  try {
    const result = await minutesService.acceptAllPendingMoms();
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        409
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



module.exports = {
  acceptRejectMinutes,
  createMinutes,
  downloadMinutes,
  createAmendmentRequest,
  updateAmendmentRequest,
  getMeetingListOfAttendees,
  deleteMinute,
  updateMinute,
  acceptMinutes,
  acceptAllPendingMoms,
  getMomAcceptDetails,
  generateMinutesPdftest,

};
