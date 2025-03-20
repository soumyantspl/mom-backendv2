const Joi = require("joi");
const Responses = require("../../helpers/response");
const { errorLog } = require("../../middlewares/errorLog");
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
      return Responses.errorResponse(req, res, error);
    }
  };
  

  

//CANCEL LEAD VALIDATOR
const cancelLeadValidator = async (req, res, next) => {
    try {
        // const headerSchema = Joi.object({
        //     authorization: Joi.string().required()
        //     .messages({ "any.required": "Authorization token is required" }),
        // }).unknown(true);

        const paramsSchema = Joi.object({
            contactId: Joi.string().required(), 
        });

        const bodySchema = Joi.object({
          
            reason: Joi.string()
                .trim()
                .min(3)
                .max(255)
                .pattern(/^[a-zA-Z0-9 @.,\-]+$/)
                .allow("") 
                .optional()
                .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" }),
                
            forwardedTo: Joi.string()
            .trim()
            .min(3)
            .max(255)
           // .allow("")
            .pattern(/^[a-zA-Z0-9 @.,\-]+$/)
            .optional()
            .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" })
  
        });

       // await headerSchema.validateAsync(req.headers);
        await paramsSchema.validateAsync(req.params);
        await bodySchema.validateAsync(req.body);

        next();
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error);
    }
};


//CLOSE LEAD VALIDATOR
const closeLeadValidator = async (req, res, next) => {
  try {
    //   const headerSchema = Joi.object({
    //       authorization: Joi.string().required().messages({ "any.required": "Authorization token is required" }),
    //   }).unknown(true);

      const paramsSchema = Joi.object({
          contactId: Joi.string().required(), 
      });

      const bodySchema = Joi.object({
    
          reason: Joi.string()
              .trim()
              .min(3)
              .max(255)
              .pattern(/^[a-zA-Z0-9 @.,\-]+$/)
              .allow("") 
              .optional()
              .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" })
      });

    //  await headerSchema.validateAsync(req.headers);
      await paramsSchema.validateAsync(req.params);
      await bodySchema.validateAsync(req.body);

      next();
  } catch (error) {
      console.log(error);
      return Responses.errorResponse(req, res, error);
  }
};


//REJECT LEAD VALIDATOR
const rejectLeadValidator = async (req, res, next) => {
  try {
    //   const headerSchema = Joi.object({
    //       authorization: Joi.string().required().messages({ "any.required": "Authorization token is required" }),
    //   }).unknown(true);

      const paramsSchema = Joi.object({
          contactId: Joi.string().required(), 
      });

      const bodySchema = Joi.object({
        
          reason: Joi.string()
              .trim()
              .min(3)
              .max(255)
              .pattern(/^[a-zA-Z0-9 @.,\-]+$/)
              .allow("") 
              .optional()
              .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" })
      });

     // await headerSchema.validateAsync(req.headers);
      await paramsSchema.validateAsync(req.params);
      await bodySchema.validateAsync(req.body);

      next();
  } catch (error) {
      console.log(error);
      return Responses.errorResponse(req, res, error);
  }
};

// FORWARD LEAD VALIDATOR
const forwardLeadValidator = async (req, res, next) => {
    try {
        // const headerSchema = Joi.object({
        //     authorization: Joi.string().required().messages({ "any.required": "Authorization token is required" }),
        // }).unknown(true);
  
        const paramsSchema = Joi.object({
            contactId: Joi.string().required(),
        });
  
        const bodySchema = Joi.object({
        
          reason: Joi.string()
              .trim()
              .min(3)
              .max(255)
              .pattern(/^[a-zA-Z0-9 @.,\-]+$/) 
              .optional()
              .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" }),

            forwardedTo: Joi.string()
                .trim()
                .min(3)
                .max(255)
                .pattern(/^[a-zA-Z0-9 @.,\-]+$/)
                .required()
                .messages({ "Allowed Inputs": "(a-z, A-Z, 0-9, @, ., space, comma, dash)" })
        });
  
      //  await headerSchema.validateAsync(req.headers);
        await paramsSchema.validateAsync(req.params);
        await bodySchema.validateAsync(req.body);
  
        next();
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error);
    }
  };
  
  const viewSingleLeadValidator = async (req, res, next) => {
    try {
        // const headerSchema = Joi.object({
        //     authorization: Joi.string().required().messages({
        //         "any.required": "Authorization token is required",
        //     }),
        // }).unknown(true);

        const paramsSchema = Joi.object({
            contactId: Joi.string().required()
        });

       // await headerSchema.validateAsync(req.headers);
        await paramsSchema.validateAsync(req.params);

        next();
    } catch (error) {
        console.log("Validation Error:", error);
        return Responses.errorResponse(req, res, error);
    }
};


module.exports = {
    contactListValidator,
    cancelLeadValidator,
    closeLeadValidator,
    rejectLeadValidator,
    forwardLeadValidator,
    viewSingleLeadValidator
}