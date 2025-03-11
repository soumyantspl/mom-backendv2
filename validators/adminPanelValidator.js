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
              .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, @, .,  space, comma, dash)` }),
          Joi.number() 
      ),

        fromDate: Joi.date().iso(),
        toDate: Joi.date().iso(),
      
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


const cancelLeadValidator = async (req, res, next) => {
    try {
        const headerSchema = Joi.object({
            authorization: Joi.string().required()
            .messages({ "any.required": "Authorization token is required" }),
        }).unknown(true);

        const paramsSchema = Joi.object({
            contactId: Joi.string().required(), // Ensures contactId is provided
        });

        const bodySchema = Joi.object({
            status: Joi.string()
                .valid("cancelled") // Only "cancelled" is allowed
                .required()
                .messages({ "any.only": "Status must be 'cancelled'" }),

            reason: Joi.string()
                .trim()
                .min(3)
                .max(255)
                .pattern(/^[a-zA-Z0-9 @.,\-]+$/) // Allowed characters
                .required()
                .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" })
        });

        await headerSchema.validateAsync(req.headers);
        await paramsSchema.validateAsync(req.params);
        await bodySchema.validateAsync(req.body);

        next();
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error, 200);
    }
};

const closeLeadValidator = async (req, res, next) => {
  try {
      const headerSchema = Joi.object({
          authorization: Joi.string().required().messages({ "any.required": "Authorization token is required" }),
      }).unknown(true);

      const paramsSchema = Joi.object({
          contactId: Joi.string().required(), // Ensures contactId is provided
      });

      const bodySchema = Joi.object({
          status: Joi.string()
              .valid("closed") // Only "closed" is allowed
              .required()
              .messages({ "any.only": "Status must be 'closed'" }),

          reason: Joi.string()
              .trim()
              .min(3)
              .max(255)
              .pattern(/^[a-zA-Z0-9 @.,\-]+$/) // Allowed characters
              .required()
              .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" })
      });

      await headerSchema.validateAsync(req.headers);
      await paramsSchema.validateAsync(req.params);
      await bodySchema.validateAsync(req.body);

      next();
  } catch (error) {
      console.log(error);
      return Responses.errorResponse(req, res, error, 200);
  }
};

const rejectLeadValidator = async (req, res, next) => {
  try {
      const headerSchema = Joi.object({
          authorization: Joi.string().required().messages({ "any.required": "Authorization token is required" }),
      }).unknown(true);

      const paramsSchema = Joi.object({
          contactId: Joi.string().required(), // Ensures contactId is provided
      });

      const bodySchema = Joi.object({
          status: Joi.string()
              .valid("rejected") // Only "rejected" is allowed
              .required()
              .messages({ "any.only": "Status must be 'rejected'" }),

          reason: Joi.string()
              .trim()
              .min(3)
              .max(255)
              .pattern(/^[a-zA-Z0-9 @.,\-]+$/) // Allowed characters
              .required()
              .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" })
      });

      await headerSchema.validateAsync(req.headers);
      await paramsSchema.validateAsync(req.params);
      await bodySchema.validateAsync(req.body);

      next();
  } catch (error) {
      console.log(error);
      return Responses.errorResponse(req, res, error, 200);
  }
};


// const leadStatusValidator = async (req, res, next) => {
//   try {
//       const paramsSchema = Joi.object({
//           contactId: Joi.string().required(), // Ensures contactId is provided
//       });

//       const bodySchema = Joi.object({
//           status: Joi.string()
//               .valid("cancelled", "closed", "rejected") // Allowed statuses
//               .required()
//               .messages({ "any.only": "Allowed values: cancelled, closed, rejected" }),

//           reason: Joi.string()
//               .trim()
//               .min(3)
//               .max(255)
//               .pattern(/^[a-zA-Z0-9 @.,\-]+$/) // Allowed characters
//               .required()
//               .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" })
//       });

//       await paramsSchema.validateAsync(req.params);
//       await bodySchema.validateAsync(req.body);

//       next();
//   } catch (error) {
//       console.log(error);
//       return Responses.errorResponse(req, res, error, 200);
//   }
// };


  module.exports = {
    contactListValidator,
    organizationListValidator,
    cancelLeadValidator,
    closeLeadValidator,
    rejectLeadValidator
  //  leadStatusValidator
};