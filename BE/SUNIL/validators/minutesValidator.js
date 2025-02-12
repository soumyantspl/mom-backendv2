const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const enumStatusValues = ["ACCEPTED", "REJECTED", "PENDING"];
const enumPriorityValues = ["HIGH", "LOW", "NORMAL"];
const regularExpression = /^[0-9a-zA-Z .(),/-]+$/;
const regularExpressionForHtml = /^(?!.*<[^>]*>).*$/;
const acceptOrRejectMinutesValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
      status: Joi.string()
        .valid(...enumStatusValues)
        .required(),
    }).required();
    const paramsSchema = Joi.object({
      minuteId: Joi.string().trim().alphanum().required(),
    });
    await paramsSchema.validateAsync(req.params);
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const createMinutesValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
      minutes: Joi.array()
        .min(1)
        .messages({
          "array.min": "minutes can't be empty!",
        })
        .items({
          organizationId: Joi.string().trim().alphanum().required(),
          meetingId: Joi.string().trim().alphanum().required(),
          agendaId: Joi.string().trim().alphanum().required(),
          title: Joi.string()
            .trim()
            .min(5)
            .max(200)
            // .pattern(regularExpressionForHtml)
            // .messages({
            //   "string.pattern.base": `HTML tags & Special letters are not allowed!`,
            // })
            .required(),
          description: Joi.string().trim().required(),
          // .max(200)
          // .pattern(regularExpressionForHtml)
          // .messages({
          //   "string.pattern.base": `HTML tags & Special letters are not allowed!`,
          // })
          isAction: Joi.boolean().strict().required(),
          priority: Joi.when("isAction", {
            is: Joi.boolean().valid(true),
            then: Joi.string().valid(...enumPriorityValues),
          }),
          dueDate: Joi.when("isAction", {
            is: Joi.boolean().valid(true),
            then: Joi.date().required(),
            otherwise: Joi.date(),
          }),
          isNewUser: Joi.when("isAction", {
            is: Joi.boolean().valid(true),
            then: Joi.boolean().strict().required(),
            otherwise: Joi.boolean().strict(),
          }),
          assignedUserId: Joi.when("isAction", {
            is: Joi.boolean().valid(true),
            then: Joi.when("isNewUser", {
              is: Joi.boolean().valid(false),
              then: Joi.string().trim().alphanum().required(),
              otherwise: Joi.string().trim().alphanum(),
              otherwise: Joi.string().trim().alphanum(),
            }),
          }),
          name: Joi.when("isAction", {
            is: Joi.boolean().valid(true),
            then: Joi.when("isNewUser", {
              is: Joi.boolean().valid(true),
              then: Joi.string().trim().required(),
              otherwise: Joi.string().allow("", null),
            }),
          }),
          email: Joi.when("isAction", {
            is: Joi.boolean().valid(true),
            then: Joi.when("isNewUser", {
              is: Joi.boolean().valid(true),
              then: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
              otherwise: Joi.string().email({ tlds: { allow: false } }),
            }),
            otherwise: Joi.string().email({ tlds: { allow: false } }),
          }),
          designation: Joi.string().trim().allow(null, ""),
          companyName: Joi.string().trim().allow(null, ""),

          attendees: Joi.array()
            .min(1)
            .messages({
              "attendees.min": "attendees can't be empty!",
            })
            .items({
              id: Joi.string().trim().alphanum().required(),
              status: Joi.string()
                .valid(...enumStatusValues)
                .required(),
            }),
        })
        .required(),
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
const downloadMinutesValidator = async (req, res, next) => {
  try {
    const paramsSchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
    });

    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error);
  }
};

const createAmendmentRequestValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      minuteId: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
      details: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({
          "string.pattern.base": `HTML tags & Special letters are not allowed!`,
        })
        .required(),
    });
    await paramsSchema.validateAsync(req.params);
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error);
  }
};

const updateAmendmentRequestValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      minuteId: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      createdById: Joi.string().trim().alphanum().required(),
      meetingId: Joi.string().trim().alphanum().required(),
      status: Joi.string()
        .valid(...enumStatusValues)
        .required(),
    });
    await paramsSchema.validateAsync(req.params);
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error);
  }
};

// FUNCTION TO GET ONLY MEETING LIST OF ATTENDEES
const getMeetingListOfAttendeesValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    }).required();

    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const deleteMinuteValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      minuteId: Joi.string().trim().alphanum().required(),
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

const updateMinuteValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      minuteId: Joi.string().trim().alphanum().required(),
    });

    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      meetingId: Joi.string().trim().alphanum().required(),
      description: Joi.string().trim().required(),
      // .pattern(regularExpressionForHtml)
      // .messages({
      //   "string.pattern.base": `HTML tags & Special letters are not allowed!`,
      // })
      title: Joi.string()
        .trim()
        .min(5)
        // .max(200)
        // .pattern(regularExpressionForHtml)
        // .messages({
        //   "string.pattern.base": `HTML tags & Special letters are not allowed!`,
        // })
        .required(),
      isAction: Joi.boolean().strict().required(),
      priority: Joi.when("isAction", {
        is: Joi.boolean().valid(true),
        then: Joi.string().valid(...enumPriorityValues),
      }),
      dueDate: Joi.when("isAction", {
        is: Joi.boolean().valid(true),
        then: Joi.date().required(),
        otherwise: Joi.date(),
      }),
      isNewUser: Joi.when("isAction", {
        is: Joi.boolean().valid(true),
        then: Joi.boolean().strict().required(),
        otherwise: Joi.boolean().strict(),
      }),
      assignedUserId: Joi.when("isAction", {
        is: Joi.boolean().valid(true),
        then: Joi.when("isNewUser", {
          is: Joi.boolean().valid(false),
          then: Joi.string().trim().alphanum().required(),
          otherwise: Joi.string().trim().alphanum(),
          otherwise: Joi.string().trim().alphanum(),
        }),
      }),
      name: Joi.when("isAction", {
        is: Joi.boolean().valid(true),
        then: Joi.when("isNewUser", {
          is: Joi.boolean().valid(true),
          then: Joi.string().trim().required(),
          otherwise: Joi.string().allow("", null),
          otherwise: Joi.string().allow("", null),
        }),
      }),
      email: Joi.when("isAction", {
        is: Joi.boolean().valid(true),
        then: Joi.when("isNewUser", {
          is: Joi.boolean().valid(true),
          then: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
          otherwise: Joi.string().email({ tlds: { allow: false } }),
        }),
        otherwise: Joi.string().email({ tlds: { allow: false } }),
      }),
      designation: Joi.string().trim().allow(null, ""),
      companyName: Joi.string().trim().allow(null, ""),

      attendees: Joi.array()
        .min(1)
        .messages({
          "attendees.min": "attendees can't be empty!",
        })
        .items({
          id: Joi.string().trim().alphanum().required(),
          status: Joi.string()
            .valid(...enumStatusValues)
            .required(),
        }),
    }).required();

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

const acceptMinutes = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      momId: Joi.string().trim(),
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

const getMomAcceptDetailsValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
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

module.exports = {
  acceptOrRejectMinutesValidator,
  createMinutesValidator,
  downloadMinutesValidator,
  createAmendmentRequestValidator,
  updateAmendmentRequestValidator,
  getMeetingListOfAttendeesValidator,
  deleteMinuteValidator,
  updateMinuteValidator,
  acceptMinutes,
  getMomAcceptDetailsValidator,
};
