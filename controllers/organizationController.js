const organizationService = require("../services/organizationService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- TO CREATE ORGANIZATION **/
const organizationRegistrationController = async (req, res) => {
  try {
    // Check for duplicate organization based on email
    const duplicateResult = await organizationService.checkDuplicateOrganization(req.body.email);
    console.log("Duplicate Result:", duplicateResult);
    if (duplicateResult) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateOrganizationFound,
        200
      );
    }
    const data = {
      name: req.body.name,
      email: req.body.email,
      phoneNo: req.body.phoneNo,
      contactPersonName: req.body.contactPersonName,
      contactPersonPhNo: req.body.contactPersonPhNo,
      contactPersonWhatsAppNo: req.body.contactPersonWhatsAppNo
    };
    console.log("data--", data)
    // Call the service to register the organization
    const result = await organizationService.organizationRegistrationService(data);
    return Responses.successResponse(
      req,
      res,
      result._id,
      messages.organizationCreated,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
//Function TO Send OTP
const registrationSendOtp = async (req, res) => {
  const organizationId = req.params.organizationId
  try {
    const result = await organizationService.organizationSendOtp(organizationId, req.body, req.headers.ip);

    if (result?.isDuplicate) {
      return Responses.failResponse(req, res, null, messages.duplicateEmail, 200);
    }

    if (result?.isMaxOtpSendOvered) {
      return Responses.failResponse(req, res, result.data, messages.isMaxOtpSendOvered, 200);
    }

    if (result?.isOtpVerified) {
      return Responses.failResponse(req, res, result.data, messages.isOtpVerified, 200);
    }

    return Responses.successResponse(
      req,
      res,
      result.data,
      await messages.otpSentSuccess(req.body.email),
      200
    );
  } catch (error) {
    console.error("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
//Function TO Verify OTP
const verifyRegistrationOtp = async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip;
    const result = await organizationService.verifyOtp(req.body, req.headers.ip);
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
/**FUNC- TO VIEW ORGANIZATION **/
const viewOrganizationController = async (req, res) => {
  const { name, email, limit, page } = req.body;
  let query = {};
  if (name && email) {
    query = { name, email };
  } else if (email) {
    query = { email };
  } else if (name) {
    query = { email };
  }
  try {
    const response = await organizationService.viewOrganizationService(
      query,
      page,
      limit
    );
    return Responses.successResponse(req, res, null, response, 200);
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW SINGLE ORGANIZATION **/
const viewSingleOrganizationController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await organizationService.viewSingleOrganizationService(id);
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
/**FUNC- TO EDIT ORGANIZATION **/
const editOrganizationController = async (req, res) => {
  try {
    const organizationId = req.params.organizationId
    const data = {
      name: req.body.name,
      email: req.body.email,
      phoneNo: req.body.phoneNo,
      contactPersonName: req.body.contactPersonName,
      contactPersonPhNo: req.body.contactPersonPhNo,
      contactPersonWhatsAppNo: req.body.contactPersonWhatsAppNo,
      organizationCode: req.body.organizationCode,
    };

    if (req.files) {
      if (req.files["dashboardLogo"]) {
        data.dashboardLogo = req.files["dashboardLogo"][0].path;
      }
      if (req.files["loginLogo"]) {
        data.loginLogo = req.files["loginLogo"][0].path;
      }
    }

    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);

    const result = await organizationService.editOrganizationService(
      req.userId,
      req.params.id,
      data,
      ip
    );

    // if (result?.error === "Organization code already exists.") {
    //   return Responses.failResponse(
    //     req,
    //     res,
    //     null,
    //     messages.duplicateOrganizationCode,
    //     200
    //   );
    // }

    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        200
      );
    }

    // Successful update response
    return Responses.successResponse(
      req,
      res,
      result._id,
      messages.organizationUpdated,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};



const editOrganizationEmailController = async (req, res) => {
  try {
    const email = req.body.email;
    console.log("Controller: New Email:", email);

    if (!email) {
      console.log("Invalid Email");
      return Responses.failResponse(req, res, null, messages.invalidEmail, 200);
    }
    const ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await organizationService.editOrganizationEmailService(
      req.userId,
      req.params.id,
      email,
      ip
    );
    console.log("Service Result:", result);
    if (result?.error === "This email is already in use by another employee.") {
      console.log("Email Already Used");
      return Responses.failResponse(req, res, null, messages.emailAlreadyUsed, 200);
    }
    if (!result) {
      console.log("Server Error");
      return Responses.failResponse(req, res, null, messages.serverError, 200);
    }
    console.log("Success Response");
    return Responses.successResponse(req, res, result._id, messages.organizationEmailUpdated, 200);
  } catch (error) {
    console.error("Error in Controller:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};


module.exports = {
  organizationRegistrationController,
  viewOrganizationController,
  editOrganizationController,
  viewSingleOrganizationController,
  registrationSendOtp,
  verifyRegistrationOtp,
  editOrganizationEmailController
};
