const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const regularExpression = /^[0-9a-zA-Z .,:;@!#&$()/\-_]+$/

exports.validateCreateDesignation = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      name: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
      organizationId: Joi.string().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
exports.editDesignationValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      name: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
      organizationId: Joi.string().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

exports.deleteDesignationValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      id: Joi.string(),
    });
    await bodySchema.validateAsync(req.body);
    await headerSchema.validateAsync({ headers: req.headers });
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

exports.listDesignationValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      searchKey: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
      name: Joi.string().alphanum().min(3).max(30),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
    });

    await paramsSchema.validateAsync(req.query);
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
