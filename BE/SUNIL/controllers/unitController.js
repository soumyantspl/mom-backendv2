const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const unitService = require("../services/unitService");
const { errorLog } = require("../middlewares/errorLog");
const googleService = require("../services/googleService");
const commonHelper = require("../helpers/commonHelper");
/**FUNC- TO CREATE UNIT**/
const createUnit = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await unitService.createUnit(req.userId, req.body, ip);
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
      null,
      messages.createdSuccess,
      201
    );
  } catch (error) {
    errorLog(error);
    console.log(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO EDIT UNIT**/
const editUnit = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await unitService.editUnit(
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
    const message =
      req.body.isActive === true
        ? messages.unitActive
        : req.body.isActive === false
        ? messages.unitDeActive
        : messages.updateSuccess;
    return Responses.successResponse(req, res, null, message, 200);
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO DELETE UNIT**/
const deleteUnit = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await unitService.deleteUnit(req.userId, req.params.id, ip);
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
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO LIST UNIT**/
const listUnit = async (req, res) => {
  try {
    const result = await unitService.listUnit(req.userId, req.body, req.query);
    if (result.totalCount == 0) {
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
/**FUNC- TO LIST ALL UNIT**/
const listAllUnitForMeeting = async (req, res) => {
  try {
    const result = await unitService.listAllUnitForMeeting(
      req.userId,
      req.body,
      req.query
    );
    if (result.totalCount == 0) {
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
/**FUNC- TO CREATE EVENT**/
const createEvent = async (req, res) => {
  try {
    await googleService.createEvent();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
module.exports = {
  createUnit,
  editUnit,
  deleteUnit,
  listUnit,
  createEvent,
  listAllUnitForMeeting,
};
