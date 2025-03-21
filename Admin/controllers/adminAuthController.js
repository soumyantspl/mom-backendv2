const messages = require("../../constants/constantMessages");
const { errorLog } = require("../../middlewares/errorLog");
const Responses = require("../../helpers/response");
const adminAuthService = require("../services/adminAuthService");
const commonHelper = require("../../helpers/commonHelper");

/**FUNC- TO SEND OTP TO SIGN IN USER */
const sendOtp = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await adminAuthService.sendOtp(req.body.email, ip);
    if (!result) {
      return Responses.failResponse(req, res, null, messages.userNotFound, 200);
    }
    if (result?.isReSendOtpAllowed == false) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.otpResendMaxLimitCrossed,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      null,
      await messages.otpSentSuccess(req.body.email),
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VERIFY OTP TO SIGN IN USER */
const verifyOtp = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await adminAuthService.verifyOtp(req.body, ip);
    if (!result) {
      return Responses.failResponse(req, res, null, messages.invalidOtp, 200);
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.otpVerifiedSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO RESEND OTP TO USER EMAIL*/
const reSendOtp = async (req, res) => {
  try {
    // const ip = req.headers["host"].split(":")[0];
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await adminAuthService.reSendOtp(req.body.email, ip);
    if (!result) {
      return Responses.failResponse(req, res, null, messages.userNotFound, 200);
    }
    if (result?.isReSendOtpAllowed == false) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.otpResendMaxLimitCrossed,
        200
      );
    }
    const message =
      result?.otpResendCount <= 3
        ? await messages.otpResendMessage(result.otpResendCount, req.body.email)
        : await messages.otpSentSuccess(req.body.email);
    return Responses.successResponse(req, res, null, message, 200);
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const loginByPassword = async (req, res) => {
    try {
        const result = await adminAuthService.loginByPassword(req.body, req.userData);

        if (!result) {
            return Responses.failResponse(req, res, null, messages.userNotFound, 200);
        }

        if (result === "invalidPassword") {
            return Responses.failResponse(req, res, null, messages.incorrectPassword, 200);
        }

        return Responses.successResponse(req, res, result, messages.signInSuccess, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};

const setPassword = async (req, res) => {
    try {
        const result = await adminAuthService.setPassword(req.body);

        if (!result) {
            return Responses.failResponse(req, res, null, messages.userNotFound, 200);
        }
         if (result?.isInValidOtp) {
              return Responses.failResponse(req, res, null, messages.invalidOtp, 200);
            }

        return Responses.successResponse(req, res, null, messages.passwordResetSuccess, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};

const addAdminController = async (req, res) => {
    try {
        const result = await adminAuthService.addAdmin(req.body);

        if (!result) {
            return Responses.failResponse(req, res, null, messages.duplicateEmail, 200);
        }

        return Responses.successResponse(req, res, result, messages.createdSuccess, 201);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};



  module.exports = {
    loginByPassword,
    setPassword,
    addAdminController,
    reSendOtp,
    verifyOtp,
    sendOtp,

  };