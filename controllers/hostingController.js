const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const hostService = require("../services/hostingService");
const commonHelper = require("../helpers/commonHelper");
const googleService=require("../services/googleService");

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

    if (req.body.hostType === "GMEET") {

  const authUrl = await googleService.googleMeetAuthUrl(req.params.organizationId);
  return Responses.successResponse(
    req,
    res,
    authUrl,
    messages.validateGauthUrl,
    200
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


// // Redirect user to Google's OAuth 2.0 consent page
// app.get("/auth", (req, res) => {
//   res.redirect(getAuthURL());
// });

// // Handle OAuth 2.0 callback
// app.get("/oauth2callback", async (req, res) => {
//   const code = req.query.code;
//   if (code) {
//     await getAccessToken(code);
//     res.send("Authentication successful! You can now create Google Meet meetings.");
//   } else {
//     res.send("Authentication failed.");
//   }
// });


/**FUNC- TO VIEW HOST DETAILS **/
const googleMeetAuthUrl = async (req, res) => {
  try {
  
    const authUrl = await googleService.googleMeetAuthUrl(req.params.organizationId);
    console.log(authUrl);
    if (!authUrl) {
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
      authUrl,
      messages.validateGauthUrl,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};


/**FUNC- TO VIEW HOST DETAILS **/
const getAccessToken = async (req, res) => {
  try {
  
    const result = await googleService.getAccessTokens(req.body.code,req.body.organizationId);
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
      messages.tokenSavedSuccess,
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
  googleMeetAuthUrl,
  getAccessToken
};
