const roomService = require("../services/roomService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- TO CREATE NEW MEETING ROOM**/
const createRoom = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await roomService.createRoom(req.userId, req.body, ip);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEntry,
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
/**FUNC- TO EDIT MEETING ROOM**/
const editRoom = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await roomService.editRoom(
      req.userId,
      req.params.id,
      req.body,
      ip
    );
    if (result.isDuplicate) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEntry,
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
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW MEETING ROOM**/
const viewRooms = async (req, res) => {
  try {
    const result = await roomService.viewRoom(req.body, req.query);
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
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO DELETE MEETING ROOM**/
const deleteRoom = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await roomService.deleteRoom(req.userId, req.params.id, ip);
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
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW MEETING ROOM**/
const viewRoomsForMeeting = async (req, res) => {
  try {
    const result = await roomService.viewRoomsForMeeting(req.body);
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
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

module.exports = {
  createRoom,
  editRoom,
  viewRooms,
  deleteRoom,
  viewRoomsForMeeting,
};
