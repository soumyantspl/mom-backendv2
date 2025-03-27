const jwt = require("jsonwebtoken");
const Responses = require("../../helpers/response");
const messages = require("../../constants/constantMessages");
const adminAuthService = require("../services/adminAuthService");
const AdminPanel = require ("../models/adminPanelModel");
const ObjectId = require("mongoose").Types.ObjectId;
const { errorLog } = require("../../middlewares/errorLog");
/*FUNC TO GENERATE NEW TOKEN FOR USER*/
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
    console.log("User Id====", userId);
   //  const isActiveUser = await adminAuthService.verifyAdmin(userId);
   const isActiveUser = await AdminPanel.findOne(
    { _id: new ObjectId(userId), isActive: true },
    {
      _id: 1,
      email: 1,
      name: 1,
      isActive: 1,
      isSuperAdmin: 1,
    }
  );
    
    if (isActiveUser) {
      req.userId = userId;
    //  req.organizationId = isActiveUser.organizationId.toString();
    //  req.isMeetingOrganiser = isActiveUser.isMeetingOrganiser;
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

module.exports = {
  generateUserToken,
  verifyUserToken,

};
