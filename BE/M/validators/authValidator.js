const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");

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
// SET PASSWORD VALIDATOR
const setPasswordValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      password: Joi.string().required(),
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
// SET SIGN IN BY PASWORD VALIDATOR
const signInByPasswordValidator = async (req, res, next) => {
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
      password: Joi.string().required(),
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
module.exports = {
  sendOtpValidator,
  verifyOtpValidator,
  setPasswordValidator,
  signInByPasswordValidator,
};
