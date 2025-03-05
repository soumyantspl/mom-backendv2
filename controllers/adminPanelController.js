const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const Responses = require("../helpers/response");
const adminPanelService = require("../services/adminPanelService");
const commonHelper = require("../helpers/commonHelper");



/** FUNC- TO GET DEMO CLIENT LIST **/
const getAllContacts = async (req, res) => {
    try {
        const params = {
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            page: req.query.page ? parseInt(req.query.page) : undefined,
            order: -1 
        };

        const body = req.body; 

        const contactList = await adminPanelService.contactUsList(params, body);

        if (!contactList || contactList.totalCount === 0) {
            return Responses.errorResponse(
                req,
                res,
                null,
                messages.recordNotFound,
                404
            );
        }

        return Responses.successResponse(
            req,
            res,
            contactList,
            messages.contactListFetched,
            200
        );
    } catch (error) {
        errorLog(error);
        console.error("Error fetching contact list:", error);
        return Responses.errorResponse(req, res, error);
    }
};


  module.exports = {
    getAllContacts
  };
  