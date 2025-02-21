const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const regularExpression = /^[0-9a-zA-Z .,:;()/\-_]+$/;
//VIEW EMPLOYEE VALIDATOR
const viewEmployeeValidator = async (req, res, next) => {
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
//CREATE EMPLOYEE VALIDATOR
const createEmployeeValidator = async (req, res, next) => {
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
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      designationId: Joi.string().trim().alphanum().required(),
      organizationId: Joi.string().trim().alphanum().required(),
      departmentId: Joi.string().trim().alphanum().required(),
      unitId: Joi.string().trim().alphanum().required(),
      isMeetingOrganiser: Joi.boolean().strict(),
      isAdmin: Joi.boolean().strict(),
      empId: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, comma, dash)` })
        .strict(),
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
// EDIT EMPLOYEE VALIDATOR
const editEmployeeValidator = async (req, res, next) => {
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
        .pattern(/^[0-9a-zA-Z -.(),-,_/]+$/)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
      email: Joi.string().email({ tlds: { allow: false } }),
      designationId: Joi.string().trim().alphanum(),
      departmentId: Joi.string().trim().alphanum(),
      unitId: Joi.string().trim().alphanum(),
      isMeetingOrganiser: Joi.boolean().strict(),
      isAdmin: Joi.boolean().strict(),
      isActive: Joi.boolean().strict(),
      empId: Joi.string()
        .trim()
        .pattern(/^[0-9a-zA-Z -.(),-,_/]+$/)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` })
        .strict(),
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
//DELETE EMPLOYEE VALIDATOR
const deleteEmployeValidator = async (req, res, next) => {
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
    await paramsSchema.validateAsync(req.params);
    await headerSchema.validateAsync({ headers: req.headers });
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
//LSIT EMPLOYEE VALIDATOR
const listEmployesValidator = async (req, res, next) => {
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

      organizationId: Joi.string().trim().alphanum().required(),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number(),
      page: Joi.number(),
      order: Joi.number(),
    });

    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    await paramsSchema.validateAsync(req.query);

    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
//VIEW EMPLOYEE VALIDATOR
const viewSingleEmployeeValidator = async (req, res, next) => {
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
    return Responses.errorResponse(req, res, error, 200);
  }
};

const masterDataValidator = async (req, res, next) => {
  try {
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
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

//CHECK DUPLICATE VISITOR USER VALIDATOR
const checkDuplicateUser = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      email: Joi.string()
        .email({ tlds: { allow: false } })
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
const listOnlyEmployeeValidator = async (req, res, next) => {
  try {
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
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

const listOnlyEmployeeAsUnitValidator = async (req, res, next) => {
  try {
    const paramsSchema = Joi.object({
      unitId: Joi.string().trim().alphanum().required(),
    });
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
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

const updtaeProfileValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.string().required(),
        ip: Joi.string().optional(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      name: Joi.string()
        .trim()
        .pattern(/^[0-9a-zA-Z -.(),-,_/]+$/)
        .min(2)
        .max(100)
        .required()
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
      isActive: Joi.boolean().strict().optional(),
      empId: Joi.string()
        .trim()
        .pattern(/^[0-9a-zA-Z -.(),-,_/]+$/)
        // .required()
        .messages({
          "string.pattern.base": "Allowed Inputs: a-z, A-Z, 0-9, space, comma, dash",
          "string.empty": "Employee ID is required",
        }),

      profilePicture: Joi.string().optional(),

      currentPassword: Joi.string().optional(),

      password: Joi.string()
        .allow('')
        .pattern(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]+$/)
        .messages({
          "string.pattern.base": "Password contains invalid characters.",
        })
        .optional(),

      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .optional()
        .when('password', {
          is: Joi.exist(),
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.only": "Confirm Password must match the Password.",
        })
    });

    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });

    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);

    next();
  } catch (error) {
    console.log("Validation Error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
module.exports = {
  viewEmployeeValidator,
  createEmployeeValidator,
  editEmployeeValidator,
  deleteEmployeValidator,
  listEmployesValidator,
  viewSingleEmployeeValidator,
  masterDataValidator,
  checkDuplicateUser,
  listOnlyEmployeeValidator,
  listOnlyEmployeeAsUnitValidator,
  updtaeProfileValidator
};
