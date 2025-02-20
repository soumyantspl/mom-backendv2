const Employee = require("../models/employeeModel");
const Department = require("../models/departmentModel");
const Units = require("../models/unitModel");
const Designations = require("../models/designationModel");

const ObjectId = require("mongoose").Types.ObjectId;
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const commonHelper = require("../helpers/commonHelper");
const emailConstants = require("../constants/emailConstants");
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
//const emailTemplates = require("../emailSetUp/emailTemplates");
const emailService = require("./emailService");
const Joi = require("joi");
const bcrypt = require('bcrypt');
const XLSX = require("xlsx");
const Organization = require("../models/organizationModel");
const BASE_URL = process.env.BASE_URL;


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

    const organization = await Organization.findOne({ _id: data.organizationId });
    const logo = organization?.dashboardLogo
      ? `${BASE_URL}/${organization.dashboardLogo.replace(/\\/g, "/")}`
      : process.env.LOGO;

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
      // const logo = process.env.LOGO;
      const mailData = await emailTemplates.createNewEmployeeEmailTemplate(
        adminDetails,
        logo,
        data
      );
      // const emailSubject = await emailConstants.createEmployeeSubject(
      //   adminDetails
      // );
      const { emailSubject, mailData: mailBody } = mailData;
      emailService.sendEmail(
        data.email,
        "Employee Created",
        emailSubject,
        mailBody,
        //  mailData
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
// const masterData = async (organizationId) => {
//   try {
//     let query = { organizationId, isDelete: false };

//     const [designationList, departmentList, unitList] = await Promise.all([
//       Designations.find(query, { name: 1, isActive: 1 }),
//       Department.find(query, { name: 1, isActive: 1 }),
//       Units.find(query, { name: 1, isActive: 1 }),
//     ]);

//     // const message = `${designationList.length} designation(s) found, ${departmentList.length} department(s) found & ${unitList.length} unit(s) found`;

//     const ws = XLSX.utils.json_to_sheet([
//       { Title: "Designation" },
//       ...designationList.map((d) => {
//         ({ Name: d.name, ID: _id })
//       }),


//       { Title: "Department" },
//       ...departmentList.map((d) => {
//         ({ Name: d.name, ID: _id })
//       }),

//       { Title: "Units" },
//       ...unitList.map((u) => ({ Name: u.name, ID: _id })),

//     ])
//     console.log("Master Data->", designationList, departmentList, unitList)


//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "MasterData")

//     const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

//     FD
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=MasterData.xlsx"
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     return excelBuffer
//   } catch (error) {
//     console.error("Error fetching master data:", error);
//     throw new Error("Failed to fetch master data.");
//   }
// };



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

// const masterDataXLSX = async (organizationId) => {
//   try {
//     let query = { organizationId, isDelete: false };

//     const [designationList, departmentList, unitList] = await Promise.all([
//       Designations.find(query, { _id: 1, name: 1 }),
//       Department.find(query, { _id: 1, name: 1 }),
//       Units.find(query, { _id: 1, name: 1 }),
//     ]);

//     const data = [];
//     let rowIndex = 0;

//     data.push(["ID", "Designations"]); 
//     let designationHeaderIndex = rowIndex++;
//     designationList.forEach((d) => data.push([d._id.toString(), d.name]));
//     data.push([]); 
//     rowIndex += designationList.length + 1;


//     data.push(["ID", "Departments"]); 
//     let departmentHeaderIndex = rowIndex++;
//     departmentList.forEach((d) => data.push([d._id.toString(), d.name]));
//     data.push([]);
//     rowIndex += departmentList.length + 1;

//     data.push(["ID", "Units"]); 
//     let unitHeaderIndex = rowIndex++;
//     unitList.forEach((u) => data.push([u._id.toString(), u.name]));

//     const ws = XLSX.utils.aoa_to_sheet(data);

//     const boldStyle = { font: { bold: true } };

//     ws[`A${designationHeaderIndex + 1}`].s = boldStyle;
//     ws[`B${designationHeaderIndex + 1}`].s = boldStyle;
//     ws[`A${departmentHeaderIndex + 1}`].s = boldStyle;
//     ws[`B${departmentHeaderIndex + 1}`].s = boldStyle;
//     ws[`A${unitHeaderIndex + 1}`].s = boldStyle;
//     ws[`B${unitHeaderIndex + 1}`].s = boldStyle;

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "MasterData");

//     const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

//     return excelBuffer;
//   } catch (error) {
//     console.error("Error generating master data Excel:", error);
//     throw new Error("Failed to generate master data.");
//   }
// };

const masterDataXLSX = async (organizationId) => {

  let query = { organizationId, isDelete: false };

  const [designationList, departmentList, unitList] = await Promise.all([
    Designations.find(query, { _id: 1, name: 1 }),
    Department.find(query, { _id: 1, name: 1 }),
    Units.find(query, { _id: 1, name: 1 }),
  ]);

  const createSheetData = (header, dataList) => {
    return [header, ...dataList.map((d) => [d._id.toString(), d.name])];
  };

  const wsDesignations = XLSX.utils.aoa_to_sheet(
    createSheetData(["ID", "Designation"], designationList)
  );

  const wsDepartments = XLSX.utils.aoa_to_sheet(
    createSheetData(["ID", "Department"], departmentList)
  );

  const wsUnits = XLSX.utils.aoa_to_sheet(
    createSheetData(["ID", "Unit"], unitList)
  );

  const sampleData = [
    ["Name", "Employee Id", "Email", "Designation", "Department", "Unit Name", "Unit Address"],
    ["Sonali Sangeeta", "SONA28238", "sonalisangeeta3992@gmail.com", "Developer", "Finance", "Byte", "Bhubaneswar-283"],
    ["Kantayani Maharana", "KANTA320398", "kantayani83746@ntspl.co.in", "Tester", "IT", "U838", "Jajpur32838"],
  ];
  const wsSample = XLSX.utils.aoa_to_sheet(sampleData);

  const autoFitColumns = (ws, data) => {
    ws["!cols"] = data[0].map((_, i) => ({
      wch: Math.max(...data.map((row) => (row[i] ? row[i].toString().length : 0)), 10) + 2,
    }));
  };

  autoFitColumns(wsDesignations, createSheetData(["ID", "Designation"], designationList));
  autoFitColumns(wsDepartments, createSheetData(["ID", "Department"], departmentList));
  autoFitColumns(wsUnits, createSheetData(["ID", "Unit"], unitList));
  autoFitColumns(wsSample, sampleData);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsDesignations, "Designations");
  XLSX.utils.book_append_sheet(wb, wsDepartments, "Departments");
  XLSX.utils.book_append_sheet(wb, wsUnits, "Units");
  XLSX.utils.book_append_sheet(wb, wsSample, "Sample Data");

  const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return excelBuffer;

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


const importEmployee = async (data, organizationId) => {
  const savedData = [];
  const duplicateRecords = [];
  const validationErrors = [];

  const regularExpression = /^[0-9a-zA-Z -.(),-,_/]+$/;
  console.log("organizationId", organizationId);

  const employeeValidationSchema = Joi.object({
    name: Joi.string()
      .trim()
      .pattern(regularExpression)
      .messages({
        "any.required": `Name is required.`,
        "string.pattern.base": `HTML tags & Special letters are not allowed for Name!`,
      }),
    email: Joi.string()
      .trim()
      .email()
      .messages({
        "any.required": `Email is required.`,
        "string.email": `Invalid email format.`,
      }),
    empId: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": `Employee ID is required.`,
        "string.pattern.base": `Allowed Inputs: (a-z, A-Z, 0-9, space, comma, dash for Employee ID)`,
      })
      .pattern(regularExpression),
    designation: Joi.string()
      .trim()
      .required()
      .pattern(regularExpression)
      .messages({
        "any.required": `Designation is required.`,
        "string.pattern.base": `HTML tags & Special letters are not allowed for Designation!`,
      }),
    department: Joi.string()
      .trim()
      .required()
      .pattern(regularExpression)
      .messages({
        "any.required": `Department is required.`,
        "string.pattern.base": `HTML tags & Special letters are not allowed for Department!`,
      }),
    unitName: Joi.string()
      .trim()
      .required()
      .pattern(regularExpression)
      .messages({
        "any.required": `Unit Name is required.`,
        "string.pattern.base": `HTML tags & Special letters are not allowed for Unit Name!`,
      }),
    unitAddress: Joi.string()
      .trim()
      .required()
      .pattern(regularExpression)
      .messages({
        "any.required": `Unit Address is required.`,
        "string.pattern.base": `HTML tags & Special letters are not allowed for Unit Address!`,
      }),
    organizationId: Joi.string()
      .required()
      .messages({
        "any.required": `Organization ID is required.`,
      }),
    designation: Joi.string().trim().pattern(regularExpression).messages({
      "string.pattern.base": `HTML tags & Special letters are not allowed for Designation!`,
    }),
    department: Joi.string().trim().pattern(regularExpression).messages({
      "string.pattern.base": `HTML tags & Special letters are not allowed for Department!`,
    }),
    unitName: Joi.string().trim().pattern(regularExpression).messages({
      "string.pattern.base": `HTML tags & Special letters are not allowed for Unit Name!`,
    }),
    unitAddress: Joi.string().trim().pattern(regularExpression).messages({
      "string.pattern.base": `HTML tags & Special letters are not allowed for Unit Address!`,
    }),
    organizationId: Joi.string().required().messages({
      "any.required": `Organization ID is required.`,
    }),
    isAdmin: Joi.boolean().strict(),
  });

  for (const record of data) {
    const { error } = employeeValidationSchema.validate(record, { abortEarly: false });

    if (error) {
      validationErrors.push({
        record,
        messages: error.details.map(err => err.message),
      });
      continue;
    }

    const duplicateFields = {};
    const existingByEmail = await Employee.findOne({
      email: record.email,
      organizationId: organizationId
    });

    const existingByEmpId = await Employee.findOne({ empId: record.empId, organizationId: organizationId });

    if (existingByEmail) {
      duplicateFields.email = true;
    }
    if (existingByEmpId) {
      duplicateFields.empId = true;
    }

    if (duplicateFields.email || duplicateFields.empId) {
      let reasonMessages = [];
      if (duplicateFields.email) {
        reasonMessages.push("Email already exists.");
      }
      if (duplicateFields.empId) {
        reasonMessages.push("Employee ID already exists.");
      }
      duplicateRecords.push({
        ...record,
        reason: reasonMessages.join(" ")
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
  masterDataXLSX,
  checkDuplicateUserEntry,
  createAttendees,
  getEmployeeListAsPerUnit,
  importEmployee,
  viewProfile
};
