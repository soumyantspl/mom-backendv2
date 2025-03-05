const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const Responses = require("../helpers/response");
const adminPanelService = require("../services/adminPanelService");
const commonHelper = require("../helpers/commonHelper");


/** FUNC- TO GET DEMO CLIENT LIST **/
const getAllContacts = async (req, res) => {
    console.log("req",req.body);
    console.log("req1",req.query);
    try {
        // const queryData = {
        //     limit: req.query.limit ? parseInt(req.query.limit) : 5,
        //     page: req.query.page ? parseInt(req.query.page) : 1,
        //     order: -1
        // };

        // const bodyData = req.body;

       // const contactList = await adminPanelService.contactUsList(bodyData, queryData);
       const result = await adminPanelService.contactUsList(

        req.body,
        req.query
       
        
    );

        if (result.totalCount == 0) {
            return Responses.failResponse(
                req,
                res,
                { totalCount: 0, contactList: [] },
                messages.recordNotFound, 
                200
            );
        }

        return Responses.successResponse(
            req,
            res,
            result,
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
  