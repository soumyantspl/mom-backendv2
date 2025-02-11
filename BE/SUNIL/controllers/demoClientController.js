const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const Responses = require("../helpers/response");
const demoClientService = require("../services/demoClientService");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- TO CREATE DEMO CLIENT **/
const createDemoClient = async (req, res) => {
  try {
    const result = await demoClientService.createDemoClient(
      req.body,
      req.headers.ip
    );
    if (result.isOtpVerified == false) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.otpNotVerified,
        200
      );
    }
    if (result.createDemoClient == false) {
      return Responses.failResponse(req, res, null, messages.invalidOtp, 200);
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.dempoCreateSuccess,
      201
    );
  } catch (error) {
    errorLog(error);
    console.log("Error creating demo client:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO SEND OTP FOR DEMO **/
const demoSendOtp = async (req, res) => {
  try {
    const result = await demoClientService.demoSendOtp(
      req.body,
      req.headers.ip
    );
    if (result?.isMaxOtpSendOvered) {
      return Responses.failResponse(
        req,
        res,
        result?.data,
        messages.isMaxOtpSendOvered,
        200
      );
    }
    if (result?.isOtpVerified) {
      return Responses.failResponse(
        req,
        res,
        result?.data,
        messages.isOtpVerified,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result?.data,
      await messages.otpSentSuccess(req.body.email),
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO FETCH DAY OPTION LIMIT **/
const verifyOtp = async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip;
    const result = await demoClientService.verifyOtp(req.body, req.headers.ip);
    if (result.isOtpNotFound) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.isOtpNotFound,
        200
      );
    }
    if (result.otpExpired) {
      return Responses.failResponse(req, res, null, messages.otpExpired, 200);
    }
    if (result.wrongOtpFound) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.wrongOtpFound,
        200
      );
    }
    if (result?.isOtpVerified) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.isOtpVerified,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.otpVerifiedSuccess,
      200
    );
  } catch (error) {
    console.log("Error verifying OTP:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, messages.serverError, 500);
  }
};
/**FUNC- TO SAVE CONTACT US DETAILS **/
const saveContactUsDetails = async (req, res) => {
  try {
    const result = await demoClientService.saveContactUsDetails(
      req.body,
      req.headers.ip
    );
    if (result.createDemoClient == false) {
      return Responses.failResponse(req, res, null, messages.invalidOtp, 200);
    }
    if (result?.isOtpVerified == false) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.otpNotVerified,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.contactUsCreateSuccess,
      201
    );
  } catch (error) {
    errorLog(error);
    console.log("Error creating demo client:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO SEND OTP FOR CONTACT US **/
const contactUsendOtp = async (req, res) => {
  try {
    const result = await demoClientService.contactUsSendOtp(
      req.body,
      req.headers.ip
    );
    if (result?.isMaxOtpSendOvered) {
      return Responses.failResponse(
        req,
        res,
        result?.data,
        messages.isMaxOtpSendOvered,
        200
      );
    }
    if (result?.isOtpVerified) {
      return Responses.failResponse(
        req,
        res,
        result?.data,
        messages.isOtpVerified,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result?.data,
      await messages.otpSentSuccess(req.body.email),
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VERIFY OTP FOR CONTACT US **/
const verifyContactUsOtp = async (req, res) => {
  try {
    const result = await demoClientService.verifyContactUsOtp(
      req.body,
      req.headers.ip
    );
    if (result.isOtpNotFound) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.isOtpNotFound,
        200
      );
    }
    if (result.otpExpired) {
      return Responses.failResponse(req, res, null, messages.otpExpired, 200);
    }
    if (result.wrongOtpFound) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.wrongOtpFound,
        200
      );
    }
    if (result?.isOtpVerified) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.isOtpVerified,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.otpVerifiedSuccess,
      200
    );
  } catch (error) {
    console.log("Error verifying OTP:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, messages.serverError, 500);
  }
};

module.exports = {
  contactUsendOtp,
  verifyContactUsOtp,
  createDemoClient,
  demoSendOtp,
  verifyOtp,
  saveContactUsDetails,
};
