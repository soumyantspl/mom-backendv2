const subscriptionService = require("../services/subscriptionService");
const Responses = require("../helpers/response"); 
const messages = require("../helpers/response"); 

const addSubscription = async (req, res) => {
    try {
        const result = await subscriptionService.addSubscription(req.body);

        if (!result) {
            return Responses.failResponse(req, res, null, messages.operationFailed, 200);
        }

        return Responses.successResponse(req, res, result, messages.subscriptionAdded, 201);
    } catch (error) {
        console.error("Error:", error);
        return Responses.errorResponse(req, res, error.message, 500);
    }
};

module.exports = {
    addSubscription,
};
