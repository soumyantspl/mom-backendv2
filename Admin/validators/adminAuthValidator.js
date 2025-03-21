const Joi = require("joi");
const Responses = require("../../helpers/response");
const { errorLog } = require("../../middlewares/errorLog");
const regularExpression = /^[0-9a-zA-Z .,:;()/\-_&\n]+$/;

const sendOtpValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        ip: Joi?.string()?.trim(),
      }).unknown(true),
    });
    const schema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
// SEND VERIFY OTP VALIDATOR
const verifyOtpValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        ip: Joi?.string()?.trim(),
      }).unknown(true),
    });
    const schema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      otp: Joi.string()
        .trim()
        .length(6)
        .pattern(/^[0-9]+$/)
        .messages({ "string.pattern.base": `OTP must have 6 digits.` })
        .required()
        .strict(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
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
          newPassword: Joi.string().min(6).max(50).required(),
          otp: Joi.string().required()
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
  
    loginByPasswordValidator,
    setPasswordValidator,
    addAdminValidator,
    verifyOtpValidator,
    sendOtpValidator,
  //  leadStatusValidator
};