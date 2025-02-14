const designationService = require("../services/designationService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- TO CREATE DESIGNATION **/
const createDesignationController = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await designationService.createDesignationService(
      req.userId,
      req.body,
      ip
    );
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
      messages.designationCreated,
      201
    );
  } catch (error) {
    console.log("controller error", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO EDIT DESIGNATION **/
const editDesignationController = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await designationService.editDesignationService(
      req.userId,
      req.params.id,
      req.body,
      ip
    );
    if (result?.isDuplicate) {
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
      messages.designationUpdated,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO DELETE DESIGNATION **/
const deleteDesignationController = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await designationService.deleteDesignationService(
      req.userId,
      req.params,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.idIsNotAvailabled,
        404
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.designationDeleted,
      202
    );
  } catch (error) {
    errorLog(error);
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO LIST DESIGNATION **/
const listDesignationController = async (req, res) => {
  try {
    const result = await designationService.listDesignationService(
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
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
module.exports = {
  createDesignationController,
  editDesignationController,
  deleteDesignationController,
  listDesignationController,
};
