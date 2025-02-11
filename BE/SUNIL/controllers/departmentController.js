const departmentService = require("../services/departmentService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- TO CREATE DEPARTMENT **/
const createDepartmentController = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await departmentService.createDepartmentService(
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
      messages.departmentCreated,
      201
    );
  } catch (error) {
    console.log("controller error", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO EDIT DEPARTMENT **/
const editDepartmentController = async (req, res) => {
  try {
    // const ip = req.headers["host"].split(":")[0];
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await departmentService.editDepartmentService(
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
      messages.departmentUpdated,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO DELETE DEPARTMENT **/
const deleteDepartmentController = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await departmentService.deleteDepartmentService(
      req.userId,
      req.params,
      ip,
      req.organizationId
    );

    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.idIsNotAvailabled,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.departmentDeleted,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO LIST DEPARTMENT **/
const listDepartmentController = async (req, res) => {
  try {
    const result = await departmentService.listDepartmentService(
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
  createDepartmentController,
  editDepartmentController,
  deleteDepartmentController,
  listDepartmentController,
};
