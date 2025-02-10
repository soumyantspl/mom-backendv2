const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const regularExpression = /^[0-9a-zA-Z -.(),-,_/]+$/;
const createDemoClientValidator = async (req, res, next) => {
  try {
    const bodyschema = Joi.object({
      name: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({
          "string.pattern.base": `HTML tags & Special letters are not allowed!`,
        })
        .required(),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      phoneNo: Joi.number()
        .integer()
        .min(10 ** 9)
        .max(10 ** 10 - 1)
        .required()
        .messages({
          "number.min": "Mobile number should be 10 digit",
          "number.max": "Mobile number should be 10 digit",
        }),
      message: Joi.string().allow(""),
    });
    await bodyschema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

const sendOtpValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      type: Joi.string().required(),
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

// SEND VERIFY OTP VALIDATOR
const verifyOtpValidator = async (req, res, next) => {
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

const saveContactUsDetailsValidator = async (req, res, next) => {
  try {
    const bodyschema = Joi.object({
      name: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({
          "string.pattern.base": `HTML tags & Special letters are not allowed!`,
        })
        .required(),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      phoneNo: Joi.number()
        .integer()
        .min(10 ** 9)
        .max(10 ** 10 - 1)
        .required()
        .messages({
          "number.min": "Mobile number should be 10 digit",
          "number.max": "Mobile number should be 10 digit",
        }),
      message: Joi.string().allow(""),
    });
    await bodyschema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

const contactUsendOtpValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      type: Joi.string().required(),
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

// SEND VERIFY OTP VALIDATOR
const verifyContactUsOtpValidator = async (req, res, next) => {
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

module.exports = {
  sendOtpValidator,
  verifyOtpValidator,
  createDemoClientValidator,
  saveContactUsDetailsValidator,
  contactUsendOtpValidator,
  verifyContactUsOtpValidator,
};
