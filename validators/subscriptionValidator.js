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
                .required(),

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
            planType: Joi.string()
                .valid("free", "basic", "premium")
                .messages({ "any.only": "Plan type must be 'free', 'basic', or 'premium'" }),

            participantLimit: Joi.number().integer()
                .messages({ "number.base": "Participant limit must be a valid number" }),

            meetingCount: Joi.number().integer()
                .messages({ "number.base": "Meeting count must be a valid number" }),

            meetingDuration: Joi.number().integer()
                .messages({ "number.base": "Meeting duration must be a valid number" }),

            price: Joi.number().integer()
                .messages({ "number.base": "Price must be a valid number" }),

            billingCycle: Joi.string()
                .valid("monthly", "early", "3year")
                .messages({ "any.only": "Billing cycle must be 'monthly', 'early', or '3year'" }),

            validity: Joi.number().integer()
                .messages({ "number.base": "Validity must be a valid number" }),
        });

        await paramsSchema.validateAsync(req.params);
        await bodySchema.validateAsync(req.body);

        next();
    } catch (error) {
        return Responses.errorResponse(req, res, error, 500);
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
        return Responses.errorResponse(req, res, error, 500);
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
        return Responses.errorResponse(req, res, error, 500);
    }
};


// const subscriptionListValidator = async (req, res, next) => {
//     try {
       
//         // const headerSchema = Joi.object({
//         //     authorization: Joi.string().required(),
//         // }).unknown(true);

        
//         const bodySchema = Joi.object({
//             searchKey: Joi.alternatives().try(
//                 Joi.string()
//                     .trim()
//                     .allow("")
//                     .pattern(/^[a-zA-Z0-9 @.,\-]+$/)
//                     .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash, @, .)` }),
//                 Joi.number()
//             ),
//             fromDate: Joi.date().iso().optional(),
//             toDate: Joi.date().iso().optional(),
//         });

        
//         const paramsSchema = Joi.object({
//             limit: Joi.number().required(),
//             page: Joi.number().required(),
//             order: Joi.number().required(),
//         });

       
//        // await headerSchema.validateAsync(req.headers);
//         await paramsSchema.validateAsync(req.query);
//         await bodySchema.validateAsync(req.body);

//         next();
//     } catch (error) {
//         console.log(error);
//         return Responses.errorResponse(req, res, error, 500);
//     }
// };

module.exports = {
    addSubscriptionValidator,
    updateSubscriptionValidator,
    deleteSubscriptionValidator,
    getSubscriptionByIdValidator,
  //  subscriptionListValidator
};
