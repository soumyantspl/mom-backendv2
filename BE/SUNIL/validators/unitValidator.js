const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const regularExpression = /^[0-9a-zA-Z .,:;()/\-_\n]+$/;
const createUnitValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodyschema = Joi.object({
      name: Joi.string()
        .trim()
        .required()
        .pattern(regularExpression)
        .min(3)
        .max(100)
        .messages({
          "string.empty": "Unit name is required.",
          "string.pattern.base":
            "Allowed Inputs: (a-z, A-Z, 0-9, space, comma, dash, colon, parentheses).",
          "string.min": "Unit name must be at least 3 characters long.",
          "string.max": "Unit name must be at most 100 characters long.",
        }),
      address: Joi.string()
        .trim()
        .required()
        .pattern(regularExpression)
        .min(3)
        .max(150)
        .messages({
          "string.empty": "Unit address is required.",
          "string.pattern.base":
            "Allowed Inputs: (a-z, A-Z, 0-9, space, comma, dash, colon, parentheses).",
          "string.min": "Unit address must be at least 3 characters long.",
          "string.max": "Unit address must be at most 150 characters long.",
        }),
      organizationId: Joi.string()
        .trim()
        .alphanum()
        .required()
        .messages({
          "string.empty": "Organization ID is required.",
          "string.alphanum": "Organization ID must contain only alphanumeric characters.",
        }),
      ip: Joi.string().optional(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodyschema.validateAsync(req.body);
    next();
  } catch (error) {
    // Log the error and send an appropriate response
    console.error("Validation Error:", error.details.map((err) => err.message));
    errorLog(error);
    return Responses.errorResponse(req, res, error.details, 200);
  }
};

const editUnitValidator = async (req, res, next) => {
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
        .min(3)
        .max(100)
        .messages({
          "string.pattern.base":
            "Allowed Inputs: (a-z, A-Z, 0-9, space, comma, dash, colon, parentheses).",
          "string.min": "Unit name must be at least 3 characters long.",
          "string.max": "Unit name must be at most 100 characters long.",
        }),
      address: Joi.string()
        .trim()
        .pattern(regularExpression)
        .min(3)
        .max(150)
        .messages({
          "string.pattern.base":
            "HTML tags & special letters are not allowed!",
          "string.min": "Unit address must be at least 3 characters long.",
          "string.max": "Unit address must be at most 150 characters long.",
        }),
      isActive: Joi.boolean().strict(),
      organizationId: Joi.string()
        .trim()
        .alphanum()
        .required()
        .messages({
          "string.empty": "Organization ID is required.",
          "string.alphanum":
            "Organization ID must contain only alphanumeric characters.",
        }),
    });
    const paramsSchema = Joi.object({
      id: Joi.string()
        .trim()
        .alphanum()
        .required()
        .messages({
          "string.empty": "Unit ID is required.",
          "string.alphanum": "Unit ID must contain only alphanumeric characters.",
        }),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);

    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

const deleteUnitValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
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
    return Responses.errorResponse(req, res, error, 200);
  }
};

const listUnitValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodyschema = Joi.object({
      searchKey: Joi.string().trim().pattern(regularExpression).messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed!`,
      }),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number(),
      page: Joi.number(),
      order: Joi.number(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.query);
    await bodyschema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
module.exports = {
  createUnitValidator,
  editUnitValidator,
  deleteUnitValidator,
  listUnitValidator,
};
