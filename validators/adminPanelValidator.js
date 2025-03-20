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
        searchKey: Joi.alternatives().try(
          Joi.string()
              .trim()
              .pattern(/^[a-zA-Z0-9 @.,\-]+$/)
              .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
          Joi.number() 
      ),

        fromDate: Joi.date().iso(),
        toDate: Joi.date().iso(),
       // phoneNo: Joi.string()
        // contactStatus: Joi.string().trim().valid("active", "inactive"),
        // organizationId: Joi.string().trim().alphanum().required(),
      });
  
      const paramsSchema = Joi.object({
        limit: Joi.number().required(),
        page: Joi.number().required(),
        order: Joi.number().required(),
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
  

  const organizationListValidator = async (req, res, next) => {
    try {

          //   const headerSchema = Joi.object({
    //     headers: Joi.object({
    //       authorization: Joi.required(),
    //     }).unknown(true),
    //   });

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

        // await headerSchema.validateAsync({ headers: req.headers });
        await paramsSchema.validateAsync(req.query);
        await bodySchema.validateAsync(req.body);

        next();
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error, 200);
    }
};


const loginByPasswordValidator = async (req, res, next) => {
  try {
      // const headerSchema = Joi.object({
      //     authorization: Joi.string().required(),
      // }).unknown(true);

      const bodySchema = Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required(),
      });

     // await headerSchema.validateAsync(req.headers);
      await bodySchema.validateAsync(req.body);

      next();
  } catch (error) {
      console.log(error);
      return Responses.errorResponse(req, res, error);
  }
};

const setPasswordValidator = async (req, res, next) => {
  try {
    // const headerSchema = Joi.object({
      //     authorization: Joi.string().required(),
      // }).

      const bodySchema = Joi.object({
          email: Joi.string().email().required(),
          newPassword: Joi.string().min(6).max(50).required()
      });

       // await headerSchema.validateAsync(req.headers);
      await bodySchema.validateAsync(req.body);
      next();
  } catch (error) {
      return Responses.errorResponse(req, res, error);
  }
};

const addAdminValidator = async (req, res, next) => {
  try {
      const bodySchema = Joi.object({
          name: Joi.string().min(3).max(50).required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(6).max(50).required(),
      });

      await bodySchema.validateAsync(req.body);
      next();
  } catch (error) {
      return Responses.errorResponse(req, res, error);
  }
};

  module.exports = {
    contactListValidator,
    organizationListValidator,
    loginByPasswordValidator,
    setPasswordValidator,
    addAdminValidator
  };
  