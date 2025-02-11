const Joi = require('joi');
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");

const templateTypeValues = ['DEMOSENDOTP', 'CONTACTUS', 'LOGINSENDOTP','SAVECONTACTDETAILS',
  'SAVEDEMODETAILS','ACTIONCOMPLETED', 'ACTIONFORWARDED', 'ACTIONREASSIGNREQUEST','ACTIONCANCEL',
  'ACTIONREASSIGNREQUESTREJECT', 'ACTIONASSIGN','ORGANIZATIONWELCOME','ADDEMPLOYEE',
   'ORGANIZATIONREGISTRATIONSENDOTP','GENERATEMOM', 'ACTIONREOPEN','ACTIONAPPROVE','RESCHEDULE','SENDSCHEDULEMEETING','RESENDSCHEDULEMEETING',
   'GIVEWRITMOMPERMISSION', "ACCEPTMINUTES",'SENDATTENDANCEDETAILS','MEETINGCANCEL', 'ACTIONREASSIGNTOOLDUSER', 'ACTIONASSIGNADMIN'];

// Common schema for fields that are shared across all template types
const commonSchema = {
  // organizationId: Joi.number().required(),
  moduleName: Joi.string(),
  templateName: Joi.string().required().regex(/^[a-zA-Z 0-9-_]+$/)
    .messages({
      'string.pattern.base': `"templateName" can only contain alphanumeric characters, hyphens, and underscores`,
    }),
  subject: Joi.string().min(20).max(200).regex(/^[a-zA-Z 0-9-_]+$/).required()
    .messages({
      'string.min': `"subject" must be at least 20 characters long.`,
      'string.max': `"subject" cannot exceed 200 characters.`,
      'string.pattern.base': `"subject" can only contain alphanumeric characters, hyphens, and underscores`,
    }),
  // logo: Joi.string().required(),
 // dear: Joi.string().required(),
  signature: Joi.string().min(20).required(),
};

// Main validation function to check schema based on templateType
const createTemplateValidator = async (req, res, next) => {
  try {
    console.log("Request Body:", req.body); // Ensure the request body is as expected

    const bodySchema = Joi.object({
      templateType: Joi.string().valid(...templateTypeValues).required(),
      ...commonSchema,
      body1: Joi.when('templateType', {
        is: 'DEMOSENDOTP',
        then: Joi.string().min(20).max(500).trim().required().regex(/^[a-zA-Z0-9 -_!@#$%^&*()+=[\]{}|;:'",.<>?/`~]+$/) .messages({
          'string.min': `"Body1" must be at least 20 characters long.`,
          'string.max': `"Body2" cannot exceed 500 characters.`,
          'string.pattern.base': `"Body" can only contain alphanumeric characters, hyphens, and underscores`,
        }),
        otherwise: Joi.string().trim(),
      }),
      body2: Joi.when('templateType', {
        is: 'DEMOSENDOTP',
        then: Joi.string().min(20).max(500).trim().required().regex(/^[a-zA-Z0-9 -_!@#$%^&*()+=[\]{}|;:'",.<>?/`~]+$/) .messages({
          'string.min': `"Body1" must be at least 20 characters long.`,
          'string.max': `"Body2" cannot exceed 500 characters.`,
          'string.pattern.base': `"Body" can only contain alphanumeric characters, hyphens, and underscores`,
        }),
      
        otherwise: Joi.string().trim(),
      }),
      body1: Joi.when('templateType', {
        is: 'CONTACTUS',
        then: Joi.string().min(20).max(500).trim().required().regex(/^[a-zA-Z0-9 -_!@#$%^&*()+=[\]{}|;:'",.<>?/`~]+$/) .messages({
          'string.min': `"Body1" must be at least 20 characters long.`,
          'string.max': `"Body2" cannot exceed 500 characters.`,
          'string.pattern.base': `"Body" can only contain alphanumeric characters, hyphens, and underscores`,
        }),
        otherwise: Joi.string().trim(),
      }),
      body2: Joi.when('templateType', {
        is: 'CONTACTUS',
        then: Joi.string().min(20).max(500).trim().required().regex(/^[a-zA-Z0-9 -_!@#$%^&*()+=[\]{}|;:'",.<>?/`~]+$/) .messages({
          'string.min': `"Body1" must be at least 20 characters long.`,
          'string.max': `"Body2" cannot exceed 500 characters.`,
          'string.pattern.base': `"Body" can only contain alphanumeric characters, hyphens, and underscores`,
        }),
        otherwise: Joi.string().trim(),
      }),
      body3: Joi.when('templateType', {
        is: 'CONTACTUS',
        then: Joi.string().min(20).max(500).trim().regex(/^[a-zA-Z0-9 -_!@#$%^&*()+=[\]{}|;:'",.<>?/`~]+$/) .messages({
          'string.min': `"Body1" must be at least 20 characters long.`,
          'string.max': `"Body2" cannot exceed 500 characters.`,
          'string.pattern.base': `"Body" can only contain alphanumeric characters, hyphens, and underscores`,
        }),
        otherwise: Joi.string().trim(),
      }),
      body1: Joi.when('templateType', {
        is: 'LOGINSENDOTP',
        then: Joi.string().min(20).max(500).trim().required().regex(/^[a-zA-Z0-9 -_!@#$%^&*()+=[\]{}|;:'",.<>?/`~]+$/) .messages({
          'string.min': `"Body1" must be at least 20 characters long.`,
          'string.max': `"Body2" cannot exceed 500 characters.`,
          'string.pattern.base': `"Body" can only contain alphanumeric characters, hyphens, and underscores`,
        }),
        otherwise: Joi.string().trim(),
      }),
      body2: Joi.when('templateType', {
        is: 'LOGINSENDOTP',
        then: Joi.string().min(20).max(500).trim().required().regex(/^[a-zA-Z0-9 -_!@#$%^&*()+=[\]{}|;:'",.<>?/`~]+$/) .messages({
          'string.min': `"Body1" must be at least 20 characters long.`,
          'string.max': `"Body2" cannot exceed 500 characters.`,
          'string.pattern.base': `"Body" can only contain alphanumeric characters, hyphens, and underscores`,
        }),
        otherwise: Joi.string().trim(),
      }),
    });

     const { error } = await bodySchema.validate(req.body, { abortEarly: false });

     if (error) {
       return Responses.errorResponse(req, res, error);
     }

    await bodySchema.validateAsync(req.body);
 
     next(); 
 
  } catch (error) {
    console.error(error);
    return Responses.errorResponse(req, res, error);
  }
};

// VALIDATOR FOR ALL TEMPLATE BY ORGANIZATION ID

const allTemplateValidator = async (req, res, next) => {
  try {
    // const headerSchema = Joi.object({
    //   headers: Joi.object({
    //     authorization: Joi.required(),
    //     ip: Joi.string(),
    //   }).unknown(true),
    // });
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum(),
    });
    // await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);

    return Responses.errorResponse(req, res, error);
  }
};

// VALIDATOR FOR TEMPLATE BY TEMPLATE TYPE
const templateByTypeValidator = async (req, res, next) => {
  try {
    // const headerSchema = Joi.object({
    //   headers: Joi.object({
    //     authorization: Joi.required(),
    //     ip: Joi.string(),
    //   }).unknown(true),
    // });
    const paramsSchema = Joi.object({
      templateType: Joi.string().trim().alphanum(),
    });
    // await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);

    return Responses.errorResponse(req, res, error);
  }
};


const updateTemplateValidator = async (req, res, next) => {
  try {
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().required(),
    });

    const bodySchema = Joi.object({
      templateType: Joi.string().valid(...templateTypeValues).required(),
      moduleName: Joi.string().required(),
      templateName: Joi.string().required().regex(/^[a-zA-Z 0-9-_]+$/)
        .messages({
          'string.pattern.base': `"templateName" can only contain alphanumeric characters, hyphens, and underscores`,
        }),
      subject: Joi.string().min(20).max(200).regex(/^[a-zA-Z 0-9-_,:@{}()]+$/).required()
        .messages({
          'string.min': `"subject" must be at least 20 characters long.`,
          'string.max': `"subject" cannot exceed 200 characters.`,
          'string.pattern.base': `"subject" can only contain alphanumeric characters, hyphens, and underscores`,
        }),
    //  dear: Joi.string().required(),
      // phoneNo: Joi.number(),
      // email: Joi.string(),

    
      body: Joi.when('templateType', {
        is: Joi.valid('DEMOSENDOTP', 'CONTACTUS', 'LOGINSENDOTP', 'SAVEDEMODETAILS', 'SAVECONTACTDETAILS',
           'ACTIONFORWARDED','ACTIONCOMPLETED', 'ACTIONREASSIGNREQUEST','ACTIONCANCEL',
           'ACTIONREASSIGNREQUESTREJECT', 'ACTIONASSIGN','ORGANIZATIONWELCOME','ADDEMPLOYEE', 
           'ORGANIZATIONREGISTRATIONSENDOTP','GENERATEMOM', 'ACTIONREOPEN','ACTIONAPPROVE','RESCHEDULE',
           'SENDSCHEDULEMEETING', 'RESENDSCHEDULEMEETING','GIVEWRITMOMPERMISSION', 'ACCEPTMINUTES',
           'SENDATTENDANCEDETAILS','MEETINGCANCEL', 'ACTIONREASSIGNTOOLDUSER', 'ACTIONASSIGNADMIN'),
        then: Joi.string().min(20).max(4000).trim().required()
          .regex(/^[a-zA-Z0-9 -_!@#$%^&*()+=[\]{}|;:'",.<>?/`~]+$/)
          .messages({
            'string.min': `"body" must be at least 20 characters long.`,
            'string.max': `"body" cannot exceed 4000 characters.`,
            // 'string.pattern.base': `"body" can only contain alphanumeric characters, hyphens, and symbols.`,
          }),
        otherwise: Joi.forbidden(),
      }),

      // signature: Joi.string().min(20).required()
        // .messages({
        //   'string.min': `"signature" must be at least 20 characters long.`,
        // }),
    });

    // Validate params and body
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body, { abortEarly: false });

    next();

  } catch (error) {
    console.log(error); 
    return Responses.errorResponse(req, res, error);
  }
};






module.exports = {
  createTemplateValidator,
  allTemplateValidator,
  templateByTypeValidator,
  updateTemplateValidator
};
