const Joi = require("joi");
const Responses = require("../helpers/response");
const regularExpression = /^[0-9a-zA-Z .(),/-]+$/;
// VIEW LOGS VALIDATOR
const viewLogsValidator = async (req, res, next) => {
  try {
    const bodySchema = Joi.object({
      searchKey: Joi.string().trim().pattern(regularExpression).messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed!`,
      }),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
    });

    await paramsSchema.validateAsync(req.query);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error);
  }
};

module.exports = {
  viewLogsValidator,
};
