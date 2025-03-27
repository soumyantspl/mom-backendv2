const subscriptionService = require("../services/subscriptionService");
const Responses = require("../../helpers/response"); 
const messages = require("../../constants/constantMessages"); 
const { errorLog } = require("../../middlewares/errorLog");

const addSubscription = async (req, res) => {
    try {
        const result = await subscriptionService.addSubscription(req.body);

        
        if (result?.existingSubscription) {
            return Responses.failResponse(req, res, null, messages.subscriptionExists, 200);
        }

        return Responses.successResponse(req, res, result, messages.subscriptionAdded, 201);
    } catch (error) {
        
        return Responses.errorResponse(req, res, error.message);
    }
};



/** FUNC - TO GET SUBSCRIPTION LIST **/
const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await subscriptionService.subscriptionList(req.body, req.query);

        if (!subscriptions || subscriptions.totalCount === 0 ) {
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
            subscriptions,
            messages.subscriptionsFetched,
            200
        );
    } catch (error) {
        errorLog(error);
        console.error("Error fetching subscription list:", error);
        return Responses.errorResponse(req, res, error);
    }
};


const updateSubscription = async (req, res) => {
    try {
        const result = await subscriptionService.updateSubscription(req.params.id, req.body);
        console.log ("Result---", result)
        if (!result) {
            return Responses.failResponse(req, res, null, messages.recordNotFound, 200);
        }
        if (result?.existingSubscription) {
            return Responses.failResponse(req, res, null, messages.subscriptionExists, 200);
        }

        return Responses.successResponse(req, res, result, messages.subscriptionUpdated, 200);
    } catch (error) {
        return Responses.errorResponse(req, res, error.message);
    }
};

const deleteSubscription = async (req, res) => {
    try {
        const result = await subscriptionService.deleteSubscription(req.params.id);

        if (!result ) {
            return Responses.failResponse(req, res, null, messages.recordNotFound, 200);
        }

        return Responses.successResponse(req, res, result, messages.subscriptionDeleted, 200);
    } catch (error) {
        return Responses.errorResponse(req, res, error.message);
    }
};

const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await subscriptionService.getSubscriptionById(id);

        if (!subscription) {
            return Responses.failResponse(req, res, null, messages.recordNotFound,200);
        }

        return Responses.successResponse(req, res, subscription, messages.subscriptionsFetched, 200);
    } catch (error) {
        return Responses.errorResponse(req, res, error);
    }
};

module.exports = {
    addSubscription,
    getSubscriptions,
    updateSubscription,
    deleteSubscription,
    getSubscriptionById
};
