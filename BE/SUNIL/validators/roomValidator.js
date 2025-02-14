const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const regularExpression = /^[0-9a-zA-Z .,:;()/\-_\n]+$/;
// CREATE ROOM VALIDATOR
const createRoomValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodyschema = Joi.object({
      title: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` })
        .required(),
      location: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` })
        .strict(),
      unitId: Joi.string().trim().alphanum().required(),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodyschema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

// EDIT ROOM VALIDATOR
const editRoomValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      title: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),

      location: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` })
        .strict(),
      unitId: Joi.string().trim().alphanum().required(),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
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
// VIEW ROOM VALIDATOR
const viewRoomValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodyschema = Joi.object({
      searchKey: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
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

// DELETE ROOM VALIDATOR
const deleteRoomValidator = async (req, res, next) => {
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
// VIEW ROOM VALIDATOR
const viewRoomsForMeeting = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodyschema = Joi.object({
      unitId: Joi.string().trim().alphanum().required(),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodyschema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
module.exports = {
  createRoomValidator,
  editRoomValidator,
  viewRoomValidator,
  deleteRoomValidator,
  viewRoomsForMeeting,
};
