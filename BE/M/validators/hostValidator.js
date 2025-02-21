const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const hostTypeValues = ["ZOOM", "GMEET", "MSTEAMS"];
const getHostDetails = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
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

const updateHostDetails = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      hostType: Joi.string().valid(...hostTypeValues),
      clientId: Joi.any().when("hostType", {
        is: "ZOOM",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
      hostKey: Joi.any().when("hostType", {
        is: "ZOOM",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
      secretToken: Joi.any().when("hostType", {
        is: "ZOOM",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
      accountId: Joi.any().when("hostType", {
        is: "ZOOM",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
      gclientId: Joi.any().when("hostType", {
        is: "GMEET",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
      gsecretToken: Joi.any().when("hostType", {
        is: "GMEET",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
      gaccountId: Joi.any().when("hostType", {
        is: "GMEET",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
      msclientId: Joi.any().when("hostType", {
        is: "MSTEAMS",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
      mssecretToken: Joi.any().when("hostType", {
        is: "MSTEAMS",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
      msaccountId: Joi.any().when("hostType", {
        is: "MSTEAMS",
        then: Joi.string().trim().required(),
        otherwise: Joi.string().trim().allow(null, ""),
        //.allow(null, ""),
      }),
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

const updateHostStatus = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      hostType: Joi.string().valid(...hostTypeValues).required(),
      isActive: Joi.boolean().required().strict(),
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
  updateHostDetails,
  getHostDetails,
  updateHostStatus,
};
