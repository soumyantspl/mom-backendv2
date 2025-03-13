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

//FUNCTION TO CANCEL LEAD
const cancelLead = async (req, res) => {
    try {
        const result = await adminPanelService.cancelLead(
            req.params.contactId, 
            req.body, 
            req.userData
        );

        if (!result) {
            return Responses.failResponse(req, res, null, "Contact not found", 404);
        }

        return Responses.successResponse(req, res, result, messages.leadUpdated, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error.message, 500);
    }
};

// Function to Close Lead
const closeLead = async (req, res) => {
    const { contactId } = req.params;
    const { status, reason } = req.body;

    if (!status || !reason) {
        return Responses.failResponse(req, res, null, "Status and reason are required", 400);
    }

    const result = await adminPanelService.closeLead(contactId, { status, reason });

    if (result) {
        return Responses.successResponse(req, res, result, messages.leadUpdated, 200);
    } else {
        console.error("Error: Contact not found");
        return Responses.errorResponse(req, res, null, "Contact not found", 404);
    }
};

// Function to Reject Lead
const rejectLead = async (req, res) => {
    const { contactId } = req.params;
    const { status, reason } = req.body;

    if (!status || !reason) {
        return Responses.failResponse(req, res, null, "Status and reason are required", 400);
    }

    const result = await adminPanelService.rejectLead(contactId, { status, reason });

    if (result) {
        return Responses.successResponse(req, res, result, messages.leadUpdated, 200);
    } else {
        console.error("Error: Contact not found");
        return Responses.errorResponse(req, res, null, "Contact not found", 404);
    }
};

  module.exports = {
    getOrganizations,
    getAllContacts,
    cancelLead,
    closeLead,
    rejectLead
  };
  