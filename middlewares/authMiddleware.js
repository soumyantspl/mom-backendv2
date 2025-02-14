const jwt = require("jsonwebtoken");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const employeeService = require("../services/employeeService");
const accessDetails = require("../accessDetails/routeAccessPermission");
const { errorLog } = require("../middlewares/errorLog");
//*FUNC TO GENERATE NEW TOKEN FOR USER*/
const generateUserToken = async (data) => {
  token = jwt.sign(data, process.env.JWT_USER_SECRET, {
    expiresIn: "365d", 
  });
  return `Bearer ${token}`;
};
/*FUNC TO VERIFY A TOKEN FOR USER*/
const verifyUserToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token.startsWith("Bearer ")) {
      token = token.substring(7, token.length);
    }
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
    const userId = decoded.userId;
    const isActiveUser = await employeeService.verifyEmployee(userId);
    if (isActiveUser) {
      req.userId = userId;
      req.organizationId = isActiveUser.organizationId.toString();
      req.isMeetingOrganiser = isActiveUser.isMeetingOrganiser;
      req.userData = isActiveUser;
      next();
    } else {
      return Responses.failResponse(
        req,
        res,
        { isInValidUser: true },
        messages.invalidUser,
        200
      );
    }
  } catch (error) {
    console.log("Errorrr", error);
    errorLog(error);
    return Responses.failResponse(req, res, null, messages.invaliToken, 200);
  }
};
/*FUNC TO VALIDATE USER PERMISSION*/
const validateUserPermission = async (req, res, next) => {
  try {
    let canAccess = false;
    const url = req.url;
    const splitUrl = url.split("?")[0];
    const userData = req.userData;
    
    if (userData.isAdmin) {
      req.isAdmin = true;
      next();
      canAccess = true;
    } else if (!userData.isAdmin && userData.isMeetingOrganiser) {
      if (accessDetails.organiserAccessUrls.includes(splitUrl)) {
        next();
        canAccess = true;
      }
    } else if (!userData.isAdmin && !userData.isMeetingOrganiser) {
      if (accessDetails.attendeesAccessUrls.includes(splitUrl)) {
        next();
        canAccess = true;
      }
    }
    if (canAccess == false) {
      return Responses.failResponse(
        req,
        res,
        { accessDenied: true },
        messages.accessDenied,
        200
      );
    }
  } catch (error) {
    console.log("Errorrr", error);
    errorLog(error);
    return Responses.failResponse(req, res, null, messages.invaliToken, 200);
  }
};
module.exports = {
  generateUserToken,
  verifyUserToken,
  validateUserPermission,
};
