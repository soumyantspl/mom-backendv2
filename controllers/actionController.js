const actionService = require("../services/actionService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- FOR ACTION COMMENT**/
const actionCommentsCreate = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await actionService.comments(
      req.userId,
      req.params.id,
      req.body,
      ip
    );
    if (!result) {
      return Responses.failResponse(req, res, null, messages.createError, 409);
    }
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.createdSuccess,
      201
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW ACTION COMMENT**/
const viewActionComment = async (req, res) => {
  try {
    const result = await actionService.viewActionComment(req.params.id);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordNotFound,
        409
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      201
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO ACTION REASSIGN REQUEST**/
const actionReassignRequest = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await actionService.actionReassignRequest(
      req.userId,
      req.params.id,
      req.body,
      req.userData,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        200
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.updateSuccess,
      201
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO REASSIGN ACTION **/
const reAssignAction = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await actionService.reAssignAction(
      req.body,
      req.params.id,
      req.userId,
      req.userData,
      ip
    );
    console.log("User Data-->", req.userData)
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        500
      );
    }
    if (result.isDuplicate) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEmail,
        500
      );
    }
    // CALL NOTIFICATION ADDED
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.updateSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO VIEW SINGLE ACTION DETAILS**/
const viewSingleAction = async (req, res) => {
  try {
    const result = await actionService.viewSingleAction(req.params.id);
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
      result[0],
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO VIEW ALL ACTIONS **/
const viewAllActions = async (req, res) => {
  try {
    const result = await actionService.viewAllAction(req.body, req.query);
    if (result.totalCount == 0) {
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

/**FUNC- TO VIEW ALL USER ACTIONS **/
const viewUserAllActions = async (req, res) => {
  try {
    const result = await actionService.viewUserAllAction(
      req.body,
      req.query,
      req.userId,
      req.userData
    );
    if (result.totalCount == 0) {
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
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO UPDATE ACTIONS **/
const updateAction = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await actionService.updateAction(
      req.params.id,
      req.body,
      req.userId,
      req.userData,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        409
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
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW  ACTION ACTIVITIES**/
const viewActionActivities = async (req, res) => {
  try {
    const result = await actionService.viewActionActivity(req.params.id);
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
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO APPROVE ACTIONS **/
const approveAction = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await actionService.approveAction(
      req.params.id,
      req.body,
      req.userId,
      ip,
      req.userData
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        409
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.approveSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO REOPEN ACTIONS **/
const reopenAction = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await actionService.reOpenAction(
      req.params.id,
      req.body,
      req.userId,
      ip,
      req.userData
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        409
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.reopenSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO REJECT REASSIGN REQUEST ACTIONS **/
const rejectReasignRequest = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await actionService.rejectReasignRequest(
      req.params.id,
      req.body,
      req.userId,
      ip,
      req.userData
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        200
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.rejectedSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO CANCEL ACTIONS **/
const cancelAction = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await actionService.cancelAction(
      req.params.id,
      req.userId,
      req.body,
      ip,
      req.userData
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        200
      );
    }
    req.app.get("io").emit("notification", "calling from backend controller ");
    return Responses.successResponse(
      req,
      res,
      result,
      messages.cancelSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW ALL ACTION STATUS REPORT **/
const totalActionList = async (req, res) => {
  try {
    const result = await actionService.totalActionList(
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
const getUserActionPriotityDetails = async (req, res) => {
  try {
    const result = await actionService.getUserActionPriotityDetails(
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

module.exports = {
  actionCommentsCreate,
  actionReassignRequest,
  viewSingleAction,
  viewActionComment,
  reAssignAction,
  viewAllActions,
  viewUserAllActions,
  updateAction,
  viewActionActivities,
  reopenAction,
  approveAction,
  rejectReasignRequest,
  cancelAction,
  totalActionList,
  getUserActionPriotityDetails,
};
