const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
// CREATE CONFIGURATION VALIDATOR
const createConfigValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      acceptanceRejectionEndtime: Joi.number(),
      amendmentRequestTime: Joi.number(),
      isAlert: Joi.boolean().required(),
      mettingReminders: Joi.object({
        hours: Joi.number().required(),
        minutes: Joi.number().required(),
      }),
      chaseOfAction: Joi.number(),
      showWriteMinutesTime: Joi.number(),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
// UPDATE CONFIGURATION VALIDATOR
const updateConfigValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      acceptanceRejectionEndtime: Joi.number(),
      amendmentRequestTime: Joi.number(),
      mettingReminders: Joi.object({
        hours: Joi.number().required(),
        minutes: Joi.number().required(),
      }),
      chaseOfAction: Joi.number(),
      showWriteMinutesTime: Joi.number(),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });

    await paramsSchema.validateAsync(req.params);
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
// VIEW CONFIGURATION VALIDATOR
const viewConfigValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
// DELETE CONFIGURATION VALIDATOR
const deleteConfigValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const getDaysOptionValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
module.exports = {
  createConfigValidator,
  updateConfigValidator,
  viewConfigValidator,
  deleteConfigValidator,
  getDaysOptionValidator
};
