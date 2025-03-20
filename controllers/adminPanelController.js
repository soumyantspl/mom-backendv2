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


const loginByPassword = async (req, res) => {
    try {
        const result = await adminPanelService.loginByPassword(req.body, req.userData);

        if (!result) {
            return Responses.failResponse(req, res, null, messages.invalidCredentials, 200);
        }

        if (result === "invalidPassword") {
            return Responses.failResponse(req, res, null, messages.incorrectPassword, 200);
        }

        return Responses.successResponse(req, res, result, messages.signInSuccess, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};

const setPassword = async (req, res) => {
    try {
        const result = await adminPanelService.setPassword(req.body);

        if (!result) {
            return Responses.failResponse(req, res, null, messages.userNotFound, 200);
        }

        return Responses.successResponse(req, res, null, messages.passwordResetSuccess, 200);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};

const addAdminController = async (req, res) => {
    try {
        const result = await adminPanelService.addAdmin(req.body);

        if (!result) {
            return Responses.failResponse(req, res, null, messages.duplicateEmail, 200);
        }

        return Responses.successResponse(req, res, result, messages.createdSuccess, 201);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};



  module.exports = {
    getOrganizations,
    getAllContacts,
    loginByPassword,
    setPassword,
    addAdminController
  };
  