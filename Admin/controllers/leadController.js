const messages = require("../../constants/constantMessages");
const { errorLog } = require("../../middlewares/errorLog");
const Responses = require("../../helpers/response");
const leadService = require("../services/leadService");
const commonHelper = require("../../helpers/commonHelper");


/** FUNC- TO GET DEMO CLIENT LIST **/
const getAllContacts = async (req, res) => {
    try {
        // const queryData = {
        //     limit: req.query.limit ? parseInt(req.query.limit) : 5,
        //     page: req.query.page ? parseInt(req.query.page) : 1,
        //     order: -1
        // };

        // const bodyData = req.body;

       // const contactList = await adminPanelService.contactUsList(bodyData, queryData);
       const contactList = await leadService.contactUsList(
        req.body,
        req.query
    );

        if (!contactList || contactList.totalCount === 0 || !contactList.data.length) {
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

//FUNCTION TO CANCEL LEAD
const cancelLead = async (req, res) => {
    try {
        const result = await leadService.cancelLead(
            req.params.contactId, 
            req.body, 
            req.userData
        );

        if (!result) {
            return Responses.failResponse(req, res, null, messages.recordNotFound, 200);
        }
        if (result.alreadyCancelled) {
            return Responses.failResponse(req, res, null, messages.alreadyCancelled, 200);
        }
        return Responses.successResponse(req, res, result, messages.leadUpdated, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};


// Function to Close Lead
const closeLead = async (req, res) => {
    try {
        const result = await leadService.closeLead(
            req.params.contactId,
            req.body,

        );

        if (!result) {
            return Responses.failResponse(req, res, null, messages.recordNotFound, 200);
        }
        if (result.alreadyCancelled) {
            return Responses.failResponse(req, res, null, messages.alreadyClosed, 200);
        }

        return Responses.successResponse(req, res, result, messages.leadUpdated, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};

// Function to Reject Lead
const rejectLead = async (req, res) => {
    try {
        const result = await leadService.rejectLead(
            req.params.contactId,
            req.body,

        );

        if (!result) {
            return Responses.failResponse(req, res, null, messages.recordNotFound, 200);
        }
        if (result.alreadyRejected) {
            return Responses.failResponse(req, res, null, messages.alreadyRejected, 200);
        }

        return Responses.successResponse(req, res, result, messages.leadUpdated, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};

// Function to Forward Lead
const forwardLead = async (req, res) => {
    try {
        const result = await leadService.forwardLead(
            req.params.contactId,
            req.body,
            req.userData,

        );

        if (!result) {
            return Responses.failResponse(req, res, null, messages.recordNotFound, 200);
        }

        return Responses.successResponse(req, res, result, messages.leadFowarded, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};

/** FUNC- TO VIEW LEAD BY ID **/
const viewSingleLeadById = async (req, res) => {
    try {
        const result = await leadService.viewSingleLeadById(req.params.contactId);

        if (!result) {
            return Responses.failResponse(req, res, null, messages.recordNotFound, 200);
        }

        return Responses.successResponse(req, res, result, messages.leadFetched, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};



module.exports = {
    getAllContacts,
    cancelLead,
    closeLead, 
    rejectLead,
    forwardLead,
    viewSingleLeadById,

  };