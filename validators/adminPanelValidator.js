const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const regularExpression = /^[0-9a-zA-Z .,:;()/\-_&\n]+$/;


const contactListValidator = async (req, res, next) => {
    try {
    //   const headerSchema = Joi.object({
    //     headers: Joi.object({
    //       authorization: Joi.required(),
    //     }).unknown(true),
    //   });
  
      const bodySchema = Joi.object({
        searchKey: Joi.string()
          .trim()
          .pattern(/^[a-zA-Z0-9 ,\-]+$/)
          .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
        fromDate: Joi.date().iso(),
        toDate: Joi.date().iso(),
        // contactStatus: Joi.string().trim().valid("active", "inactive"),
        // organizationId: Joi.string().trim().alphanum().required(),
      });
  
      const paramsSchema = Joi.object({
        limit: Joi.number().optional(),
        page: Joi.number().optional(),
        order: Joi.number().optional(),
      });
  
     // await headerSchema.validateAsync({ headers: req.headers });
      await paramsSchema.validateAsync(req.query);
      await bodySchema.validateAsync(req.body);
  
      next();
    } catch (error) {
      console.log(error);
      return Responses.errorResponse(req, res, error, 200);
    }
  };
  
  module.exports = {contactListValidator};
  