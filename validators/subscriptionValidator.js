const Joi = require("joi");
const Responses = require("../helpers/response");


const addSubscriptionValidator = async (req, res, next) => {
    try {
        const bodySchema = Joi.object({
            planType: Joi.string()
               // .valid("free", "basic", "premium")
                .required(),

            participantLimit: Joi.number()
                .required(),

            meetingCount: Joi.number()
                .required(),

            meetingDuration: Joi.number()
                .required(),

            price: Joi.number().precision(2)
                .required(),

            billingCycle: Joi.string()
                .valid("monthly", "yearly", "3year")
                .required()
                .messages({ "any.only": "Billing cycle must be 'monthly', 'yearly', or '3year'" }),

            validity: Joi.number()
                .required(),

            // isActive: Joi.boolean()
            //     .optional()
        });

        await bodySchema.validateAsync(req.body);

        next();
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error);
    }
};



const subscriptionListValidator = async (req, res, next) => {
    try {
       
        // const headerSchema = Joi.object({
        //     authorization: Joi.string().required(),
        // }).unknown(true);

        
        const bodySchema = Joi.object({
            searchKey: Joi.alternatives().try(
                Joi.string()
                    .trim()
                    .pattern(/^[a-zA-Z0-9 @.,\-]+$/)
                    .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash, @, .)` }),
                Joi.number()
            ),
            fromDate: Joi.date().iso().optional(),
            toDate: Joi.date().iso().optional(),
        });

        
        const paramsSchema = Joi.object({
            limit: Joi.number().required(),
            page: Joi.number().required(),
            order: Joi.number().required(),
        });

       
       // await headerSchema.validateAsync(req.headers);
        await paramsSchema.validateAsync(req.query);
        await bodySchema.validateAsync(req.body);

        next();
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error);
    }
};


const updateSubscriptionValidator = async (req, res, next) => {
    try {
        // Validate headers if needed
        // const headerSchema = Joi.object({
        //     authorization: Joi.string().required(),
        // }).unknown(true);

        const paramsSchema = Joi.object({
            id: Joi.string()
                .required()
                .messages({ "any.invalid": "Invalid MongoDB ObjectId" }),
        });

        const bodySchema = Joi.object({
            planType: Joi.string(),

            participantLimit: Joi.number().integer(),

            meetingCount: Joi.number().integer(),

            meetingDuration: Joi.number().integer(),

            price: Joi.number().precision(2),

            billingCycle: Joi.string()
                .valid("monthly", "yearly", "3year")
                .messages({ "any.only": "Billing cycle must be 'monthly', 'yearly', or '3year'" }),

            validity: Joi.number().integer(),
        });

        await paramsSchema.validateAsync(req.params);
        await bodySchema.validateAsync(req.body);

        next();
    } catch (error) {
        return Responses.errorResponse(req, res, error);
    }
};


const deleteSubscriptionValidator = async (req, res, next) => {
    try {
       
        // const headerSchema = Joi.object({
        //     authorization: Joi.string().required(),
        // }).unknown(true);

        
        const paramsSchema = Joi.object({
            id: Joi.string().required(),
        });

      //  await headerSchema.validateAsync(req.headers);
        await paramsSchema.validateAsync(req.params);

        next();
    } catch (error) {
        return Responses.errorResponse(req, res, error);
    }
};
const getSubscriptionByIdValidator = async (req, res, next) => {
    try {
        const paramsSchema = Joi.object({
            id: Joi.string()
                .required()
                .messages({ "any.required": "Subscription ID is required" }),
        });

        await paramsSchema.validateAsync(req.params);
        next();
    } catch (error) {
        return Responses.errorResponse(req, res, error);
    }
};

module.exports = {
    addSubscriptionValidator,
    updateSubscriptionValidator,
    deleteSubscriptionValidator,
 //   subscriptionListValidator,
 getSubscriptionByIdValidator
};
