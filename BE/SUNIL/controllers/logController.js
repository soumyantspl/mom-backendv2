const logService = require("../services/logsService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");

/**FUNC- TO VIEW LOG LISTS**/
const viewLogs = async (req, res) => {
  try {
    const result = await logService.viewLogs(req.body, req.query);
    if (result.totalCount == 0) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    if (req.body.isActive == false) {
      return Responses.successResponse(req, res, result, messages.active, 200);
    }
    if (req.body.isActive == true) {
      return Responses.successResponse(
        req,
        res,
        result,
        messages.deActive,
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
    console.log("Controller error:", error);;
    return Responses.errorResponse(req, res, error);
  }
};

module.exports = {
  viewLogs,
};
