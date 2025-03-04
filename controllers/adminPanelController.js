const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const Responses = require("../helpers/response");
const adminPanelService = require("../services/adminPanelService");
const commonHelper = require("../helpers/commonHelper");


/** FUNC- TO GET DEMO CLIENT LIST **/
const getAllContacts = async (req, res) => {
    try {
      const demoClients = await adminPanelService.contactUsList();
  
      return Responses.successResponse(
        req,
        res,
        demoClients,
        messages.contactListFetched,
        200
      );
    } catch (error) {
      errorLog(error);
      console.log("Error fetching demo client list:", error);
      return Responses.errorResponse(req, res, error);
    }
  };


  module.exports = {
    getAllContacts
  };
  