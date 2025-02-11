const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const regularExpressionForHtml = /^(?!.*<[^>]*>).*$/;
const regEx = /^[0-9a-zA-Z .,:;()/\-_&\n]+$/;

const createAgendaValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      meetingId: Joi.string().trim().alphanum().required(),
      title: Joi.string().min(2).max(100).required(),
      // topic: Joi.string().trim().allow(null, ""),
      topic: Joi.string()
        .trim()
        // .min(5)
        // .max(200)
        // .pattern(regularExpressionForHtml)
        // .messages({
        //   "string.pattern.base": `HTML tags & Special letters are not allowed!`,
        // })
        .allow(null, ""),
      timeLine: Joi.number(),
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

const createAgendaWithMinutesValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      agendaData: Joi.array()
        .min(1)
        .messages({
          "array.min": "agenda can't be empty!",
        })
        .items({
          organizationId: Joi.string().trim().alphanum().required(),
          meetingId: Joi.string().trim().alphanum().required(),
          title: Joi.string().trim().min(5).max(100).required(),
          topic: Joi.string()
            .trim()
            // .min(5)
            // .max(200)
            // .pattern(regularExpressionForHtml)
            // .messages({
            //   "string.pattern.base": `HTML tags & Special letters are not allowed!`,
            // })
            .allow(null, ""),
          //topic: Joi.string().trim().allow(null, ""),
          timeLine: Joi.number(),
        }),
    }).required();
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

const updateAgendaValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      agendaId: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      meetingId: Joi.string().trim().alphanum().required(),
      title: Joi.string().trim().min(5).max(100).required(),
      // topic: Joi.string().trim().min(5).max(250).allow(null, ""),
      timeLine: Joi.number(),
      topic: Joi.string()
        .trim()
        // .min(5)
        // .max(200)
        // .pattern(regularExpressionForHtml)
        // .messages({
        //   "string.pattern.base": `HTML tags & Special letters are not allowed!`,
        // })
        .allow(null, ""),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const deleteAgendaValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      agendaId: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

module.exports = {
  createAgendaValidator,
  createAgendaWithMinutesValidator,
  updateAgendaValidator,
  deleteAgendaValidator,
};
