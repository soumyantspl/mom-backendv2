const Employee = require("../models/employeeModel");
const Department = require("../models/departmentModel");
const Units = require("../models/unitModel");
const Designations = require("../models/designationModel");

const ObjectId = require("mongoose").Types.ObjectId;
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const commonHelper = require("../helpers/commonHelper");
const emailConstants = require("../constants/emailConstants");
const emailTemplates = require("../emailSetUp/emailTemplates");
const emailService = require("./emailService");
const Joi = require("joi");
const bcrypt = require('bcrypt');


/**FUNC- CREATE EMPLOYEE */
const createEmployee = async (userId, data, ipAddress) => {
  const [emailDetails, empCodeDetails] = await checkDuplicate(
    data.email,
    data.organizationId,
    data.empId
  );
  if (emailDetails) {
    return {
      isDuplicateEmail: true,
    };
  }
  if (empCodeDetails) {
    return {
      isDuplicateEmpCode: true,
    };
  }
  if (!emailDetails && !empCodeDetails) {
    const inputData = {
      name: data.name,
      organizationId: data.organizationId,
      email: data.email,
      designationId: data.designationId,
      departmentId: data.departmentId,
      unitId: data.unitId,
      // isMeetingOrganiser: data.isMeetingOrganiser,
      isMeetingOrganiser: true,
      isAdmin: data.isAdmin,
      empId: data.empId,
    };
    const empData = new Employee(inputData);
    const result = await empData.save();
    const adminResult = await Employee.aggregate([
      {
        $match: { _id: new ObjectId(userId) },
      },

      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organizationDetail",
        },
      },
      {
        $project: {
          email: 1,
          name: 1,
          isAdmin: 1,
          organizationDetail: {
            name: 1,
            _id: 1,
            loginLogo: 1,
          },
        },
      },
      { $unwind: "$organizationDetail" },
    ]);
    if (adminResult.length !== 0) {
      const adminDetails = adminResult[0];
      const logo = process.env.LOGO;
      const mailData = await emailTemplates.createNewEmployeeEmailTemplate(
        adminDetails,
        logo,
        data
      );
      const emailSubject = await emailConstants.createEmployeeSubject(
        adminDetails
      );
      emailService.sendEmail(
        data.email,
        "Employee Created",
        emailSubject,
        mailData
      );
    }
    ////////////////////LOGER START
    const logData = {
      moduleName: logMessages.Employee.moduleName,
      userId,
      action: logMessages.Employee.createEmployee,
      ipAddress,
      details: "Employe's name: " + `<strong>${data.name}</strong>`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
    ///////////////////// LOGER END
    return result;
  }
  return false;
};
/**FUNC- TO FETCH MASTER DATA*/
const masterData = async (organizationId) => {
  let query = { organizationId: organizationId, isDelete: false };
  const designationList = await Designations.find(query, {
    name: 1,
    isActive: 1,
    isDelete: 1,
  });
  const departmentList = await Department.find(query, {
    name: 1,
    isActive: 1,
    isDelete: 1,
  });
  const unitList = await Units.find(query, {
    name: 1,
    isActive: 1,
    isDelete: 1,
  });
  const message = `${designationList.length} designation found , ${departmentList.length} department found &  ${unitList.length} unit found `;
  const masterData = { designationList, departmentList, unitList };
  return {
    message,
    masterData,
  };
};

/**FUNC- TO DELETE AN EMPLOYEE */
const deleteEmploye = async (userId, id, ipAddress) => {
  const result = await Employee.findByIdAndUpdate(
    { _id: id },
    { isDelete: true },
    { new: true }
  );

  ////////////////////LOGER START
  const logData = {
    moduleName: logMessages.Employee.moduleName,
    userId,
    action: logMessages.Employee.deleteEmployee,
    ipAddress,
    details:
      "Employee " +
      `<strong>${result.name}</strong>` +
      logMessages.Employee.deleteEmployeeDetails,
    organizationId: result.organizationId,
  };
  await logService.createLog(logData);
  ///////////////////// LOGER END
  return result;
};

/**FUNC- TO VERIFY DUPLICATE EMPLOYEE */
const checkDuplicate = async (email, organizationId, empId) => {
  return await Promise.all([
    checkDuplicateEmail(email, organizationId),
    checkDuplicateEmpId(empId, organizationId),
  ]);
};
/**FUNC- TO VERIFY DUPLICATE USER */
const checkDuplicateUserEntry = async (data) => {
  return await checkDuplicateEmail(data.email, data.organizationId);
};
const checkDuplicateEmail = async (email) => {
  return await Employee.findOne({ email });
};
const checkDuplicateEmpId = async (empId) => {
  return await Employee.findOne({ empId });
};
/**FUNC- TO SEE LIST OF EMPLOYEE */
const listEmployee = async (bodyData, queryData) => {
  const { order } = queryData;
  const { organizationId, searchKey, updatedAt } = bodyData;
  let query = searchKey
    ? {
      $and: [
        {
          $or: [
            { name: { $regex: searchKey, $options: "i" } },
            { empId: { $regex: searchKey, $options: "i" } },
          ],
        },
        {
          organizationId: new ObjectId(organizationId),
          isEmployee: true,
          isDelete: false,
        },
      ],
    }
    : {
      organizationId: new ObjectId(organizationId),
      isEmployee: true,
      isDelete: false,
    };
  if (updatedAt) {
    query.updatedAt = updatedAt;
  }
  const limit = queryData.limit ? parseInt(queryData.limit) : 0;
  const skip = queryData.page ? (parseInt(queryData.page) - 1) * limit : 0;
  const aggregationPipelineForTotalCount = [
    { $match: query },
    {
      $lookup: {
        from: "designations",
        localField: "designationId",
        foreignField: "_id",
        as: "designationDetails",
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "departmentId",
        foreignField: "_id",
        as: "departmentDetails",
      },
    },
    {
      $lookup: {
        from: "units",
        localField: "unitId",
        foreignField: "_id",
        as: "unitDetails",
      },
    },
    {
      $unwind: {
        path: "$designationDetails",
      },
    },
    {
      $unwind: {
        path: "$departmentDetails",
      },
    },
    {
      $unwind: {
        path: "$unitDetails",
      },
    },
  ];
  const aggregationPipeline = [
    { $match: query },
    {
      $lookup: {
        from: "designations",
        localField: "designationId",
        foreignField: "_id",
        as: "designationDetails",
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "departmentId",
        foreignField: "_id",
        as: "departmentDetails",
      },
    },
    {
      $lookup: {
        from: "units",
        localField: "unitId",
        foreignField: "_id",
        as: "unitDetails",
      },
    },
    {
      $unwind: {
        path: "$designationDetails",
      },
    },
    {
      $unwind: {
        path: "$departmentDetails",
      },
    },
    {
      $unwind: {
        path: "$unitDetails",
      },
    },
    { $sort: { _id: parseInt(order) } },
    { $skip: skip },
    { $limit: limit },
  ];
  const totalCount = await Employee.aggregate(aggregationPipelineForTotalCount);
  const newRes = await Employee.find();
  const employeeData = await Employee.aggregate(aggregationPipeline);
  const formattedEmployeeData = employeeData.map((t) => {
    const { formattedTime, formattedDate } = commonHelper.formatDateTimeFormat(
      t.updatedAt
    );
    return {
      ...t,
      formattedDate: formattedDate,
      formattedTime: formattedTime,
    };
  });
  return { totalCount: totalCount.length, employeeData: formattedEmployeeData };
};
/**FUNC- TO SEE SINGLE EMPLOYE DETAILS */
const viewSingleEmployee = async (id) => {
  const singleEmployeeDetails = await Employee.aggregate([
    {
      $match: {
        _id: new ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "designations",
        localField: "designationId",
        foreignField: "_id",
        as: "designationDetails",
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "departmentId",
        foreignField: "_id",
        as: "departmentDetails",
      },
    },
    {
      $lookup: {
        from: "units",
        localField: "unitId",
        foreignField: "_id",
        as: "unitDetails",
      },
    },
    {
      $unwind: {
        path: "$designationDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$departmentDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$unitDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
  return singleEmployeeDetails[0];
};

/**FUNC- TO VERIFY ACTIVE USER*/
const verifyEmployee = async (empId) => {
  return await Employee.findOne(
    { _id: new ObjectId(empId), isActive: true },
    {
      _id: 1,
      email: 1,
      organizationId: 1,
      name: 1,
      isActive: 1,
      isMeetingOrganiser: 1,
      isAdmin: 1,
    }
  );
};
/**FUNC- EDIT EMPLOYEE */
const checkDuplicateEntry = async (email, organizationId, empId) => {
  const emailDetails = await Employee.findOne({ email, organizationId });
  const empCodeDetails = await Employee.findOne({ empId, organizationId });
  return [emailDetails, empCodeDetails];
};

const editEmployee = async (userId, id, data, ipAddress) => {
  if (data.email) {
    const emailCheck = await Employee.findOne({
      email: data.email,
      _id: { $ne: id },
    });
    if (emailCheck) {
      return { isDuplicateEmail: true };
    }
  }

  if (data.empId) {
    const idCheck = await Employee.findOne({
      empId: data.empId,
      _id: { $ne: id },
    });
    if (idCheck) {
      return { isDuplicateEmpCode: true };
    }
  }

  const result = await Employee.findByIdAndUpdate(id, data, { new: false });
  if (!result) {
    return;
  }
  //////////////////// LOGGER START
  let logDetails = [];
  const employeeName = result.name || "Unknown Employee";
  const email = result.email || "Email not available";
  if (result.name !== data.name) {
    logDetails.push(
      `Name changed from <strong>${result.name}</strong> to <strong>${data.name}</strong>`
    );
  }
  if (result.email !== data.email) {
    logDetails.push(
      `Email changed from <strong>${result.email}</strong> to <strong>${data.email}</strong>`
    );
  }
  if (result.empId !== data.empId) {
    logDetails.push(
      `Employee ID changed from <strong>${result.empId}</strong> to <strong>${data.empId}</strong>`
    );
  }

  if (result.designationId?.toString() !== data.designationId?.toString()) {
    const oldDesignation = await Designations.findById(result.designationId);
    const newDesignation = await Designations.findById(data.designationId);
    logDetails.push(
      `Designation changed from <strong>${oldDesignation?.name || "N/A"
      }</strong> to <strong>${newDesignation?.name || "N/A"}</strong>`
    );
  }

  if (result.departmentId?.toString() !== data.departmentId?.toString()) {
    const oldDepartment = await Department.findById(result.departmentId);
    const newDepartment = await Department.findById(data.departmentId);
    logDetails.push(
      `Department changed from <strong>${oldDepartment?.name || "N/A"
      }</strong> to <strong>${newDepartment?.name || "N/A"}</strong>`
    );
  }

  if (result.unitId?.toString() !== data.unitId?.toString()) {
    const oldUnit = await Units.findById(result.unitId);
    const newUnit = await Units.findById(data.unitId);
    logDetails.push(
      `Unit changed from <strong>${oldUnit?.name || "N/A"
      }</strong> to <strong>${newUnit?.name || "N/A"}</strong>`
    );
  }
  if (
    result.isMeetingOrganiser !== data.isMeetingOrganiser ||
    result.isAdmin !== data.isAdmin
  ) {
    let roleChangeLog = "";

    if (result.isMeetingOrganiser && !data.isMeetingOrganiser && data.isAdmin) {
      roleChangeLog = "changed from Meeting Organizer to Admin";
    } else if (result.isAdmin && !data.isAdmin && data.isMeetingOrganiser) {
      roleChangeLog = "changed from Admin to Meeting Organizer";
    } else if (result.isMeetingOrganiser && !data.isMeetingOrganiser) {
      roleChangeLog = "removed from Meeting Organizer to Normal User";
    } else if (result.isAdmin && !data.isAdmin) {
      roleChangeLog = "removed from Admin to Normal User";
    } else if (!result.isAdmin && data.isAdmin) {
      roleChangeLog = "set as Admin";
    } else if (!result.isMeetingOrganiser && data.isMeetingOrganiser) {
      roleChangeLog = "set as Meeting Organizer";
    }

    if (roleChangeLog) {
      logDetails.push(`Role changed:,<strong> ${roleChangeLog}</strong>`);
    }
  }

  let logData;

  if (data.isActive === true) {
    logData = {
      moduleName: logMessages.Employee.moduleName,
      userId,
      action: logMessages.Employee.employeeStatus,
      ipAddress,
      details: `Employee <strong>${employeeName}</strong> is Activated`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
  } else if (data.isActive === false) {
    logData = {
      moduleName: logMessages.Employee.moduleName,
      userId,
      action: logMessages.Employee.employeeStatus,
      ipAddress,
      details: `Employee <strong>${employeeName}</strong> is Deactivated`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
  } else if (logDetails.length > 0) {
    logData = {
      moduleName: logMessages.Employee.moduleName,
      userId,
      action: logMessages.Employee.updateEmployee,
      ipAddress,
      details: `${logDetails.join(" , ")}`,
      subDetails: `Employee Name:${employeeName}(${email})`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
  }
  //////////////////// LOGGER END
  console.log("logDetails->", logDetails)
  return { data: result };
};

/**FUNC- ADD VISITOR AS ATTENDEE IN EMPLOYEE */
const createAttendee = async (
  name,
  email,
  organizationId,
  designation = null,
  companyName = null
) => {
  const emailDetails = await checkDuplicateEmail(email, organizationId);
  if (!emailDetails) {
    const inputData = {
      name,
      email,
      organizationId: new ObjectId(organizationId),
      isEmployee: false,
    };
    if (designation) {
      inputData.designation = designation;
    }
    if (companyName) {
      inputData.companyName = companyName;
    }
    const empData = new Employee(inputData);
    const newEmp = await empData.save();
    return newEmp;
  }
  return {
    isDuplicate: true,
    duplicateUserId: emailDetails._id,
  };
};
/**FUNC- ADD VISITORS AS ATTENDEE IN EMPLOYEE */
const createAttendees = async (attendees) => {
  const newEmps = await Employee.insertMany(attendees);
  const newEmpData = newEmps.map((item) => {
    return { _id: item._id };
  });
  // return newEmpData;
  return newEmps;
};
/**FUNC- TO SEE LIST OF ONLY EMPLOYEE */
const listOnlyEmployee = async (organizationId) => {
  const allEmployees = await Employee.find({
    isActive: true,
    organizationId,
    isDelete: false,
    isEmployee: true,
  }).sort({ _id: -1 });
  return allEmployees;
};
/**FUNC- TO SEE LIST OF ONLY EMPLOYEE */
const getEmployeeListAsPerUnit = async (unitId) => {
  const allEmployees = await Employee.find({
    isActive: true,
    isDelete: false,
    unitId,
    isEmployee: true,
  }).sort({ _id: -1 });
  return allEmployees;
};


const importEmployee = async (data) => {
  const savedData = [];
  const duplicateRecords = [];
  const validationErrors = [];

  const regularExpression = /^[0-9a-zA-Z -.(),-,_/]+$/;

  const employeeValidationSchema = Joi.object({
    name: Joi.string()
      .trim()
      .pattern(regularExpression)
      .required()
      .messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed for Name!`,
        "any.required": "Name is required."
      }),
    email: Joi.string()
      .trim()
      .email()
      .required()
      .messages({
        "string.email": `Invalid email format.`,
        "any.required": "Email is required."
      }),
    empId: Joi.string()
      .trim()
      .pattern(regularExpression)
      .required()
      .messages({
        "string.pattern.base": `Allowed Inputs: (a-z, A-Z, 0-9, space, comma, dash for Employee ID)`,
        "any.required": "Employee Id is required."
      }),
    designation: Joi.string()
      .trim()
      .required()  // Mark designation as required
      .pattern(regularExpression)
      .messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed for Designation!`,
        "any.required": "Designation is required."
      }),
    department: Joi.string()
      .trim()
      .required()  // Mark department as required
      .pattern(regularExpression)
      .messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed for Department!`,
        "any.required": "Department is required."
      }),
    unitName: Joi.string()
      .trim()
      .required()  // Mark unitName as required
      .pattern(regularExpression)
      .messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed for Unit Name!`,
        "any.required": "Unit Name is required."
      }),
    unitAddress: Joi.string()
      .trim()
      .pattern(regularExpression)
      .allow('') // optional field
      .messages({
        "string.pattern.base": `HTML tags & Special letters are not allowed for Unit Address!`,
      }),
    organizationId: Joi.string()
      .required()
      .messages({
        "any.required": `Organization ID is required.`,
      }),
  });


  for (const record of data) {
    if (record.email) {
      record.email = record.email.toLowerCase();
    }

    const duplicateFields = {};
    const existingByEmail = await Employee.findOne({ email: record.email });
    const existingByEmpId = await Employee.findOne({ empId: record.empId });

    if (existingByEmail) {
      duplicateFields.email = record.email;
    }
    if (existingByEmpId) {
      duplicateFields.empId = record.empId;
    }

    if (Object.keys(duplicateFields).length > 0) {
      duplicateRecords.push(duplicateFields);
      continue;
    }

    const { error } = employeeValidationSchema.validate(record, { abortEarly: false });
    if (error) {
      const combinedErrorMessage = error.details.map(detail => detail.message).join(" | ")
      validationErrors.push({
        record,
        message: combinedErrorMessage,
      });
      continue;
    }

    let designationId;
    const existingDesignation = await Designations.findOne({
      name: record.designation,
      organizationId: record.organizationId,
    });

    if (existingDesignation) {
      designationId = existingDesignation._id;
    } else {
      const newDesignation = await Designations.create({
        name: record.designation,
        organizationId: record.organizationId,
        isActive: true,
        isDelete: false,
      });
      designationId = newDesignation._id;
    }

    let departmentId;
    const existingDepartment = await Department.findOne({
      name: record.department,
      organizationId: record.organizationId,
    });

    if (existingDepartment) {
      departmentId = existingDepartment._id;
    } else {
      const newDepartment = await Department.create({
        name: record.department,
        organizationId: record.organizationId,
        isActive: true,
        isDelete: false,
      });
      departmentId = newDepartment._id;
    }

    let unitId;
    const existingUnit = await Units.findOne({
      name: record.unitName,
      organizationId: record.organizationId,
    });

    if (existingUnit) {
      unitId = existingUnit._id;
    } else {
      const newUnit = await Units.create({
        name: record.unitName,
        address: record.unitAddress,
        organizationId: record.organizationId,
        isActive: true,
        isDelete: false,
      });
      unitId = newUnit._id;
    }

    const newEmployee = new Employee({
      ...record,
      designationId,
      departmentId,
      unitId,
    });

    const savedRecord = await newEmployee.save();
    savedData.push(savedRecord);
    console.log("Saved Data--->>", savedRecord);
  }


  return { savedData, duplicateRecords, validationErrors };
};

const viewProfile = async (userId, id, data, ipAddress, profilePicture) => {
  if (profilePicture && profilePicture.filename) {
    const filePath = `/uploads/${profilePicture.filename}`;
    data.profilePicture = filePath;
  } else {
    console.log("No new profile picture provided.");
  }
  

  const employee = await Employee.findById(id);
  if (!employee) {
    return { error: "Employee not found." };
  }

  let logDetails = [];
  const employeeName = employee.name || "Unknown Employee";
  const email = employee.email || "Email not available";

  if (data.password && data.confirmPassword) {
    if (data.password.trim() !== data.confirmPassword.trim()) {
      return { error: "New password and Confirm Password do not match." };
    }

    if (!employee.password) {
      // First-time password setting
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
      logDetails.push("Password was set successfully.");
    } else {
      if (!data.currentPassword) {
        return { error: "Current password is required for updating password." };
      }

      // Compare entered current password with stored password
      const isMatch = await bcrypt.compare(data.currentPassword, employee.password);

      if (!isMatch) {
        return { isMatch: false };
      }

      // Hash the new password before saving
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
      logDetails.push("Password was updated successfully.");
    }

    delete data.confirmPassword;
    delete data.currentPassword;
  } else {
    delete data.password;
    delete data.confirmPassword;
    delete data.currentPassword;
  }

  console.log("Data to update:", data);

  const result = await Employee.findByIdAndUpdate(id, data, { new: true });
  if (!result) {
    return { error: "Update failed." };
  }

  if (result.name !== employee.name) {
    logDetails.push(`Name changed from <strong>${employee.name}</strong> to <strong>${result.name}</strong>`);
  }
  if (result.email !== employee.email) {
    logDetails.push(`Email changed from <strong>${employee.email}</strong> to <strong>${result.email}</strong>`);
  }
  if (result.empId !== employee.empId) {
    logDetails.push(`Employee ID changed from <strong>${employee.empId}</strong> to <strong>${result.empId}</strong>`);
  }
  if (result.profilePicture !== employee.profilePicture) {
    logDetails.push(`Profile Picture updated.`);
  }

  return { data: result, logs: logDetails };
};






module.exports = {
  createEmployee,
  listEmployee,
  verifyEmployee,
  editEmployee,
  deleteEmploye,
  listOnlyEmployee,
  viewSingleEmployee,
  createAttendee,
  masterData,
  checkDuplicateUserEntry,
  createAttendees,
  getEmployeeListAsPerUnit,
  importEmployee,
  viewProfile
};
