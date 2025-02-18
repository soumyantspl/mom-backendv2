const configService = require("../services/configService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- TO CREATE CONFIGURATION**/
// const createConfig = async (req, res) => {
//   try {
//     let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
//     const result = await configService.createConfig(req.userId, req.body, ip);
//     if (req.body.isAlert == false) {
//       if (result?.isUpdated) {
//         return Responses.successResponse(
//           req,
//           res,
//           result.data,
//           messages.configUpdateSuccess,
//           200
//         );
//       }
//       req.app
//         .get("io")
//         .emit("notification", "calling from backend controller ");
//       return Responses.successResponse(
//         req,
//         res,
//         result.data,
//         messages.configCreatedSuccess,
//         201
//       );
//     } else {
//       if (result?.isUpdated) {
//         return Responses.successResponse(
//           req,
//           res,
//           result.data,
//           messages.alertUpdateSuccess,
//           200
//         );
//       }
//       req.app
//         .get("io")
//         .emit("notification", "calling from backend controller ");
//       return Responses.successResponse(
//         req,
//         res,
//         result.data,
//         messages.alertCreatedSuccess,
//         201
//       );
//     }
//   } catch (error) {
//     console.log("Controller error:", error);
//     errorLog(error);
//     return Responses.errorResponse(req, res, error);
//   }
// };

const createConfig = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await configService.createConfig(req.userId, req.body, ip);

   
    if (result?.isDraftCleanupValid) {
      const errMsg = messages.notValid;
      return Responses.failResponse(
        req,
        res,
        null,
        errMsg,
        200
      );
    }

    // If no validation issues, continue with the normal flow
    if (req.body.isAlert === false) {
      if (result?.isUpdated) {
        return Responses.successResponse(
          req,
          res,
          result.data,
          messages.configUpdateSuccess,
          200
        );
      }
      req.app.get("io").emit("notification", "calling from backend controller ");
      return Responses.successResponse(
        req,
        res,
        result.data,
        messages.configCreatedSuccess,
        201
      );
    } else {
      if (result?.isUpdated) {
        return Responses.successResponse(
          req,
          res,
          result.data,
          messages.alertUpdateSuccess,
          200
        );
      }
      req.app.get("io").emit("notification", "calling from backend controller ");
      return Responses.successResponse(
        req,
        res,
        result.data,
        messages.alertCreatedSuccess,
        201
      );
    }
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};


module.exports = { createConfig };
/**FUNC- TO EDIT CONFIGURATION**/
const editConfig = async (req, res) => {
  try {
    const result = await configService.editConfig(req.body, req.params.id);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
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
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO VIEW CONFIGURATION **/
const viewConfig = async (req, res) => {
  try {
    const result = await configService.viewConfig(req.params.organizationId);
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
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

/**FUNC- TO DELETE CONFIGURATION **/
const deleteConfig = async (req, res) => {
  try {
    const result = await configService.deleteConfig(req.params.id);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.deleteFailedRecordNotFound,
        409
      );
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.deleteSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO FETCH DAY OPTION LIMIT **/
const fetchDaysOptionLimit = async (req, res) => {
  try {
    const result = await configService.fetchDaysOptionLimit(req);
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
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
module.exports = {
  createConfig,
  editConfig,
  viewConfig,
  deleteConfig,
  fetchDaysOptionLimit,
};
