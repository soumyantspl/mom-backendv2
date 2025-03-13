const Joi = require("joi");
const Responses = require("../helpers/response");

const addSubscriptionValidator = async (req, res, next) => {
    try {
        const bodySchema = Joi.object({
            planType: Joi.string()
                .valid("free", "basic", "premium")
                .required()
                .messages({ "any.only": "Plan type must be 'free', 'basic', or 'premium'" }),

            participantLimit: Joi.number()
                .required()
                .messages({ "any.required": "Participant limit is required" }),

            meetingCount: Joi.number()
                .required()
                .messages({ "any.required": "Meeting count is required" }),

            meetingDuration: Joi.number()
                .required()
                .messages({ "any.required": "Meeting duration is required" }),

            price: Joi.number()
                .required()
                .messages({ "any.required": "Price is required" }),

            billingCycle: Joi.string()
                .valid("monthly", "early", "3year")
                .required()
                .messages({ "any.only": "Billing cycle must be 'monthly', 'early', or '3year'" }),

            validity: Joi.number()
                .required()
                .messages({ "any.required": "Validity is required" }),

            // isActive: Joi.boolean()
            //     .optional()
        });

        await bodySchema.validateAsync(req.body);

        next();
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error, 500);
    }
};

module.exports = {
    addSubscriptionValidator
};
