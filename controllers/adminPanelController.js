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

/** FUNC- TO GET ORGANIZATION LIST **/
const getOrganizations = async (req, res) => {
    try {
        const organizationList = await adminPanelService.organizationList(req.body, req.query);

        if (!organizationList || organizationList.totalCount === 0 || !organizationList.data.length) {
            return Responses.failResponse(
                req,
                res,
                { totalCount: 0, data: [] },
                messages.recordNotFound,
                200
            );
        }

        return Responses.successResponse(
            req,
            res,
            organizationList,
            messages.organizationsFetched,
            200
        );
    } catch (error) {
        errorLog(error);
        console.error("Error fetching organization list:", error);
        return Responses.errorResponse(req, res, error);
    }
};


  module.exports = {
    getOrganizations,
    getAllContacts
  };
  