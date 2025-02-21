const Joi = require("joi");
const { errorLog } = require("../middlewares/errorLog");
const Responses = require("../helpers/response");
const regularExpression = /^[0-9a-zA-Z .,:;()/\-_@&$'"#]+$/;

exports.createOrganisationValidator = async (req, res, next) => {
  try {
    const bodySchema = Joi.object({
      name: Joi.string().alphanum().min(2).max(100).required(),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      phoneNo: Joi.number()
        .integer()
        .min(10 ** 9)
        .max(10 ** 10 - 1)
        .messages({
          "number.min": "Mobile number should be 10 digit",
          "number.max": "Mobile number should be 10 digit",
        }),
      organizationCode: Joi.string().required(),
    });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

exports.viewOrganizationValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      name: Joi.string().alphanum().min(3).max(30),
      email: Joi.string().email({ tlds: { allow: false } }),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

exports.editOrganizationValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      name: Joi.string().alphanum().min(2).max(100),
      email: Joi.string().email({ tlds: { allow: false } }),
      phoneNo: Joi.number()
        .integer()
        .min(10 ** 9)
        .max(10 ** 10 - 1)
        .messages({
          "number.min": "Mobile number should be 10 digit",
          "number.max": "Mobile number should be 10 digit",
        }),

      organizationCode: Joi.string(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};



exports.registrationSendOtpValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      name: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({
          "string.pattern.base": `HTML tags & Special letters are not allowed!`,
        })
        .required(),
    });

    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

exports.registrationVerifyOtpValidator = async (req, res, next) => {
  try {
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
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};