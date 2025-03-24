const Joi = require("joi");
const Responses = require("../../helpers/response");

const emailLogListValidator = async (req, res, next) => {
    try {
        const bodySchema = Joi.object({
            searchKey: Joi.alternatives().try(
                Joi.string()
                    .trim()
                    .allow("")
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

        await paramsSchema.validateAsync(req.query);
        await bodySchema.validateAsync(req.body);

        next();
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error);
    }
};

module.exports = { emailLogListValidator };
