const authService = require("../services/authService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
/**FUNC- TO SEND OTP TO SIGN IN USER */
const sendOtp = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await authService.sendOtp(req.body.email, ip);
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
    const result = await authService.verifyOtp(req.body, ip);
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
    const result = await authService.reSendOtp(req.body.email, ip);
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
/**FUNC- TO SET PASSWORD FOR SIGN IN*/
const setPassword = async (req, res) => {
  try {
    // const ip = req.headers["host"].split(":")[0];
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await authService.setPassword(req.body, ip);
    if (!result) {
      return Responses.failResponse(req, res, null, messages.userNotFound, 200);
    }
    if (result?.isInValidOtp) {
      return Responses.failResponse(req, res, null, messages.invalidOtp, 200);
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.passwordResetSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- FOR SIGN IN BY PASSWORD**/
const signInByPassword = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await authService.signInByPassword(req.body, ip);
    if (!result) {
      return Responses.failResponse(req, res, null, messages.userNotFound, 200);
    }
    if (result?.incorrectPassword) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.incorrectPassword,
        200
      );
    }
    if (result?.isPasswordReset) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.passwordReset,
        200
      );
    }
    if (result?.isUserDeactivated) {
      return Responses.failResponse(req, res, null, messages.invalidUser, 200);
    }

    return Responses.successResponse(
      req,
      res,
      result,
      messages.signInSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO SET PASSWORD OF FORGOT PASSWORD FOR SIGN IN*/
const forgotPassword = async (req, res) => {
  try {
    // const ip = req.headers["host"].split(":")[0];
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await authService.forgotPassword(req.body, ip);
    if (!result) {
      return Responses.failResponse(req, res, null, messages.userNotFound, 200);
    }
    if (result?.isInValidOtp) {
      return Responses.failResponse(req, res, null, messages.invalidOtp, 200);
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.passwordResetSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

// API for Google Authentication

/**FUNC- TO SET PASSWORD OF FORGOT PASSWORD FOR SIGN IN*/
const loginByGmail = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    console.log(req.body)
     const result = await authService.loginByGmailAccessToken(req.body, ip);
    if (!result) {
      return Responses.failResponse(req, res, null, messages.userNotFound, 200);
    }
    if (result?.isUserDeactivated) {
      return Responses.failResponse(req, res, null, messages.invalidUser, 200);
    }

    return Responses.successResponse(
      req,
      res,
      result,
      messages.signInSuccess,
      200
    );
  } catch (err) {
    console.log(err)
    res.status(400).json({ err });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  reSendOtp,
  setPassword,
  forgotPassword,
  signInByPassword,
  loginByGmail,
};
