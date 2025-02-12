const alertService = require("../services/alertService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");

const createAlert = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await alertService.createAlert(req.userId, req.body, ip);
    if (result?.isUpdated) {
      return Responses.successResponse(
        req,
        res,
        result.data,
        messages.alertUpdateSuccess,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.alertCreatedSuccess,
      result.isUpdated ? 200 : 201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

module.exports = {
  createAlert,
};
