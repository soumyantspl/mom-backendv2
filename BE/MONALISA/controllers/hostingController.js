const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const hostService = require("../services/hostingService");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- TO VIEW HOST DETAILS **/
const getHostDetails = async (req, res) => {
  try {
    const result = await hostService.getHostDetails(
      req.params.organizationId,
      req.userId
    );
    console.log(result);
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
/**FUNC- TO UPDATE HOST DETAILS **/
const updateHostDetails = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await hostService.updateHostDetails(
      req.params.organizationId,
      req.body,
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
      result,
      messages.updateSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);

    if (error?.response?.status == 400) {
      return Responses.failResponse(
        req,
        res,
        null,
        error?.response?.data?.reason,
        200
      );
    }

    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO UPDATE HOST STATUS **/
const updateHostStatus = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await hostService.updateHostStatus(
      req.params.organizationId,
      req.body,
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

module.exports = {
  updateHostDetails,
  getHostDetails,
  updateHostStatus,
};
