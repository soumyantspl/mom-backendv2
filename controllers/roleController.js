const roleService = require("../services/roleService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
/**FUNC- TO CREATE NEW ROLE**/
const createRole = async (req, res) => {
  try {
    const result = await roleService.createRole(userId, req.body, req.ip);
    console.log(result);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEntry,
        409
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
    console.log(error);
    // errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO EDIT ROLE **/
const editRole = async (req, res) => {
  try {
    const result = await roleService.updateRole(
      req.userId,
      req.params.id,
      req.body,
      req.ip
    );
    console.log(result);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        409
      );
    }
    if (result.isDuplicateName) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateName,
        409
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
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW ROLE **/
const viewRole = async (req, res) => {
  try {
    const result = await roleService.viewRole(req.body);
    console.log(result);
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
/**FUNC- TO DELETE ROLE **/
const deleteRole = async (req, res) => {
  try {
    const result = await roleService.deleteRole(
      req.userId,
      req.params.id,
      req.ip
    );
    console.log(result);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordNotFound,
        409
      );
    }
    if (result.isDuplicateName) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateName,
        409
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
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

module.exports = {
  createRole,
  editRole,
  viewRole,
  deleteRole,
};
