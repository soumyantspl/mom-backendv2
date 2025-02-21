const notificationService = require("../services/notificationService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- TO CREATE NOTIFICATION **/
const createNotification = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await notificationService.createNotification(
      req.userId,
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
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW ALL NOTIFICATIONS **/
const viewNotification = async (req, res) => {
  try {
    const result = await notificationService.viewNotification(
      req.body,
      req.userId
    );
    if (result?.totalCount == 0) {
      return Responses.failResponse(
        req,
        res,
        result,
        messages.recordsNotFound,
        200
      );
    }
    const message = req.body.isImportant
      ? messages.markAsImportant
      : req.body.isRead === true
      ? messages.markAsRead
      : req.body.isRead === false
      ? messages.markAsUnRead
      : messages.allNotification;

    return Responses.successResponse(req, res, result, message, 200);
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO UPDATE NOTIFICATION **/
const editNotification = async (req, res) => {
  try {
    const result = await notificationService.editNotification(
      req.params.id,
      req.body,
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
    if (req.body.isRead == true && result.isRead) {
      return Responses.successResponse(req, res, result, messages.isRead, 200);
    }
    if (req.body.isRead == false && result.isRead == false) {
      return Responses.successResponse(
        req,
        res,
        result,
        messages.isUnread,
        200
      );
    }
    if (req.body.isImportant == true && result.isImportant) {
      return Responses.successResponse(
        req,
        res,
        result,
        messages.isImportant,
        200
      );
    }
    if (result.isDelete && result.isDelete) {
      return Responses.successResponse(
        req,
        res,
        result,
        messages.isDelete,
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
    console.log("Error occurred:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO DELETE NOTIFICATIONS **/
const deleteNotification = async (req, res) => {
  try {
    const result = await notificationService.deleteNotification(
      req.params.agendaId,
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
      messages.deleteSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
module.exports = {
  createNotification,
  editNotification,
  viewNotification,
  deleteNotification,
};
