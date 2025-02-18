const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const statusEnumData = [
  "PENDING",
  "REQUESTFORREASSIGN",
  "REASSIGNED",
  "COMPLETED",
  "REOPENED",
  "APPROVED",
  "CANCELLED",
  // "DELAYED",
  // "NOTDELAYED",
];
const delayStatusEnumData = ["DELAYED", "NOTDELAYED"];
//const regularExpression = /^[0-9a-zA-Z ,/-]+$/;
const enumPriorityValues = ["HIGH", "LOW", "NORMAL"];
const regularExpression = /^[0-9a-zA-Z .,:;()/\-_\n]+$/;
const actionCommentsValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      actionId: Joi.string().trim().alphanum().required(),
      userId: Joi.string().trim().alphanum().required(),
      commentDescription: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .pattern(regularExpression)
        .messages({
          "string.pattern.base": `HTML tags & Special letters are not allowed!`,
        }),
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
// ACTION REASSIGN REQUEST VALIDATOR
const actionReassignRequestValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      requestDetails: Joi.string().trim().pattern(regularExpression).messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed!`,
      }),
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
    return Responses.errorResponse(req, res, error);
  }
};

// VIEW SINGLE ACTION VALIDATOR
const viewSingleActionValidator = async (req, res, next) => {
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

// ACTION REASSIGN VALIDATOR
const reAssignActionValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      priority: Joi.string()
        .valid(...enumPriorityValues)
        .required(),
      isNewUser: Joi.boolean().required(),
      dueDate: Joi.date(),
      // reassignedUserName: Joi.when("isNewUser", {
      //   is: Joi.boolean().valid(false),
      //   then: Joi.string().required(),
      //   otherwise: Joi.string(),
      // }),
      name: Joi.when("isNewUser", {
        is: Joi.boolean().valid(true),
        then: Joi.string().alphanum().required(),
        otherwise: Joi.string().alphanum(),
      }),
      email: Joi.when("isNewUser", {
        is: Joi.boolean().valid(true),
        then: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        otherwise: Joi.string().email({ tlds: { allow: false } }),
      }),
      designation: Joi.string().trim().allow(null, ""),
      companyName: Joi.string().trim().allow(null, ""),
      organizationId: Joi.string().trim().alphanum().required(),
      lastActionActivityId: Joi.string().trim().alphanum().allow(null, ""),
      reAssignReason: Joi.string().trim().pattern(regularExpression).messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed!`,
      }),
      reAssignedId: Joi.when("isNewUser", {
        is: Joi.boolean().valid(true),
        then: Joi.string().alphanum().allow(null, ""),
        otherwise: Joi.string().alphanum().required(),
      }),
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
    return Responses.errorResponse(req, res, error);
  }
};

// VIEW ALL ACTION LIST VALIDATOR
const viewAllActionsValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      searchKey: Joi.string().trim().pattern(regularExpression).messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed!`,
      }),
      createdById: Joi.string().trim().alphanum(),
      assignedUserId: Joi.string().trim().alphanum(),
      meetingId: Joi.string().trim().alphanum(),
      actionStatus: Joi.string().valid(...statusEnumData),
      delayStatus: Joi.string().valid(...delayStatusEnumData),
      fromDate: Joi.date().iso(),
      toDate: Joi.date().iso(),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.query);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

// UPDATE SINGLE ACTION VALIDATOR
const updateActionValidator = async (req, res, next) => {
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
    const bodySchema = Joi.object({
      isComplete: Joi.boolean(),
      comment: Joi.string().trim().min(3).max(100),
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

// UPDATE SINGLE ACTION ACTIVITIES VALIDATOR
const viewActionActivities = async (req, res, next) => {
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

const viewActionCommentValidator = async (req, res, next) => {
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
// ACTION REASSIGN REQUEST VALIDATOR
const actionReassignRequestRejectValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      rejectReason: Joi.string().trim().pattern(regularExpression).messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed!`,
      }),
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
    return Responses.errorResponse(req, res, error);
  }
};

// APPROVE ACTION VALIDATOR
const approveActionValidator = async (req, res, next) => {
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
    const bodySchema = Joi.object({
      assignedUserDetails: Joi.object({
        name: Joi.string().trim().required(),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        _id: Joi.string().trim().alphanum().required(),
      }).required(),
      remark: Joi.string().trim().allow(null, ""),
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

// REOPEN ACTION VALIDATOR
const reopenActionValidator = async (req, res, next) => {
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
    const bodySchema = Joi.object({
      remark: Joi.string().trim().min(1).max(200).required(),
      assignedUserDetails: Joi.object({
        name: Joi.string().trim().required(),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        _id: Joi.string().trim().alphanum().required(),
      }).required(),
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
// ACTION REASSIGN RJECT VALIDATOR
const rejectReasignRequestValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      assignedUserId: Joi.string().trim().alphanum().required(),
      rejectDetails: Joi.string().trim().pattern(regularExpression).messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed!`,
      }),
      lastActionActivityId: Joi.string().trim().alphanum().required()
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
    return Responses.errorResponse(req, res, error);
  }
};

// ACTION CANCEL VALIDATOR
const cancelActionValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      assignedUserDetails: Joi.object({
        name: Joi.string().trim().required(),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        _id: Joi.string().trim().alphanum().required(),
      }).required(),
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
    return Responses.errorResponse(req, res, error);
  }
};
// ACTION STATUS DATA
const totalActionList = async (req, res, next) => {
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


// ACTION STATUS DATA
const getUserActionPriotityDetailsValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      searchKey: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.query);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

const ChartbarClickforalldata = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      meetingId:Joi.string().trim().required(),
      searchKey: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.query);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

const ChartbarClickattendee = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      meetingId:Joi.string().trim(),
      assignedUserId:Joi.string().trim(),
      searchKey: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.query);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};


module.exports = {
  actionCommentsValidator,
  actionReassignRequestValidator,
  viewSingleActionValidator,
  reAssignActionValidator,
  viewAllActionsValidator,
  updateActionValidator,
  viewActionActivities,
  viewActionCommentValidator,
  reopenActionValidator,
  approveActionValidator,
  cancelActionValidator,
  rejectReasignRequestValidator,
  totalActionList,
  getUserActionPriotityDetailsValidator,
  ChartbarClickforalldata,
  ChartbarClickattendee
};
