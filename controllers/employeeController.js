const employeeService = require("../services/employeeService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");

// const columnMapping = {
//   Name: "name",
//   "Employee Id": "empId",
//   Email: "email",
//   "Designation Id": "designationId",
//   "Department Id": "departmentId",
//   "Unit Id": "unitId",
//   // "Unit Address": "unitAddress",
// };
const columnMapping = {
  Name: "name",
  "Employee Id": "empId",
  Email: "email",
  "Designation Id": "designationId",
  "Department Id": "departmentId",
  "Unit Id": "unitId",
  // "Unit Address": "unitAddress",
};

/**FUNC- TO CREATE EMPLOYEE**/
const createEmployee = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await employeeService.createEmployee(
      req.userId,
      req.body,
      ip
    );
    if (result?.isDuplicateEmail) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEmail,
        200
      );
    }
    if (result?.isDuplicateEmpCode) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEmpCode,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.createdSuccess,
      201
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO EDIT EMPLOYEE **/
const editEmployee = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await employeeService.editEmployee(
      req.userId,
      req.params.id,
      req.body,
      ip
    );

    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        200
      );
    }
    if (result?.isDuplicateEmail) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEmail,
        200
      );
    }
    if (result?.isDuplicateEmpCode) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.duplicateEmpCode,
        200
      );
    }
    const message =
      req.body.isActive === true
        ? messages.active
        : req.body.isActive === false
          ? messages.deActive
          : messages.updateSuccess;

    return Responses.successResponse(req, res, result, message, 200);
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO DELETE EMPLOYEE**/
const deleteEmploye = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await employeeService.deleteEmploye(
      req.userId,
      req.params.id,
      ip
    );
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.deleteFailedRecordNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      null,
      messages.deleteSuccess,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO LIST EMPLOYEE**/
const listEmployee = async (req, res) => {
  try {
    const result = await employeeService.listEmployee(req.body, req.query);
    if (result.totalCount == 0) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW EMPLOYEE**/
const viewSingleEmploye = async (req, res) => {
  try {
    const result = await employeeService.viewSingleEmployee(req.params.id);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW MASTER DATA OF EMPLOYEE**/

const masterData = async (req, res) => {
  try {
    const result = await employeeService.masterData(req.params.organizationId);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result.masterData,
      result.message,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

// const masterData = async (req, res) => {
//   try {
//     const result = await employeeService.masterData(req.params.organizationId);
//     if (!result) {
//       return Responses.failResponse(
//         req,
//         res,
//         null,
//         messages.recordsNotFound,
//         200
//       );
//     }
//     return Responses.successResponse(
//       req,
//       res,
//       result.masterData,
//       result.message,
//       200
//     );
//   } catch (error) {
//     console.log("Controller error:", error);
//     errorLog(error);
//     return Responses.errorResponse(req, res, error);
//   }
// };

const masterDataXLSX = async (req, res) => {
  try {
    const excelBuffer = await employeeService.masterDataXLSX(req.params.organizationId);

    if (!excelBuffer) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }

    res.setHeader("Content-Disposition", "attachment; filename=MasterData.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(excelBuffer);
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};


/**FUNC- TO CHECK DUPLICATE USER**/
const checkDuplicateUser = async (req, res) => {
  try {
    const result = await employeeService.checkDuplicateUserEntry(req.body);
    const resultObject = {
      isDuplicateUser: true,
    };
    if (!result) {
      resultObject.isDuplicateUser = false;
      return Responses.successResponse(
        req,
        res,
        resultObject,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      resultObject,
      messages.duplicateEmail,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW ONE EMPLOYEE**/
const listOnlyEmployee = async (req, res) => {
  try {
    const result = await employeeService.listOnlyEmployee(
      req.params.organizationId
    );
    if (result.length == 0) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW EMPLOYEE LIST PER UNIT**/
const getEmployeeListAsPerUnit = async (req, res) => {
  try {
    const result = await employeeService.getEmployeeListAsPerUnit(
      req.params.unitId
    );
    if (result.length == 0) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log("Controller error:", error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const writeErrorFile = (duplicateRecords, validationErrors) => {
  const workbook = xlsx.utils.book_new();
  const reverseMapping = {};

  Object.entries(columnMapping).forEach(([excelCol, schemaField]) => {
    reverseMapping[schemaField] = excelCol;
  });

  const buildRowObject = (recordData, reason = "") => {
    const rowObject = {
      "Employee Id": recordData?.empId || "",
      Email: recordData?.email || "",
      Reason: reason,
    };

    Object.keys(recordData || {}).forEach((schemaField) => {
      if (
        schemaField === "email" ||
        schemaField === "empId" ||
        schemaField === "Reason"
      )
        return;
      const excelCol = reverseMapping[schemaField] || schemaField;
      rowObject[excelCol] = recordData[schemaField] || "";
    });

    return rowObject;
  };

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    const formattedValidationErrors = validationErrors.map((err) =>
      buildRowObject(err, err.Reason)
    );
    const errorSheet = xlsx.utils.json_to_sheet(formattedValidationErrors);
    xlsx.utils.book_append_sheet(workbook, errorSheet, "Validation Errors");

    if (formattedValidationErrors.length > 0) {
      errorSheet["!cols"] = Object.keys(formattedValidationErrors[0]).map(
        (colKey) => ({
          wpx: Math.max(
            ...formattedValidationErrors.map((row) =>
              row[colKey] ? row[colKey].toString().length : 0
            ),
            colKey.length
          ) * 10,
        })
      );
    }
  }

  const formatDuplicateRecords = duplicateRecords?.map((dupObj) => {
    const { organizationId, duplicateFlags, ...data } = dupObj || {};

    let reasonMsg = [];
    if (duplicateFlags?.email) {
      reasonMsg.push("Email already exists.");
    }
    if (duplicateFlags?.empId) {
      reasonMsg.push("Employee ID already exists.");
    }

    reasonMsg = reasonMsg.length > 0 ? reasonMsg.join(" ") : "Duplicate entry";
    return buildRowObject(data, reasonMsg);
  }) || [];



  if (formatDuplicateRecords.length > 0) {
    const duplicateSheet = xlsx.utils.json_to_sheet(formatDuplicateRecords);
    xlsx.utils.book_append_sheet(workbook, duplicateSheet, "Duplicate Records");

    if (formatDuplicateRecords.length > 0) {
      duplicateSheet["!cols"] = Object.keys(formatDuplicateRecords[0]).map((colKey) => ({
        wpx: Math.max(
          ...formatDuplicateRecords.map((row) => (row[colKey] ? row[colKey].toString().length : 0)),
          colKey.length
        ) * 10,
      }));
    }
  }

  const fileName = `error_report_${Date.now()}.xlsx`;
  const errorFilePath = path.join(__dirname, "../Downloads", fileName);

  if (!fs.existsSync(path.join(__dirname, "../Downloads"))) {
    fs.mkdirSync(path.join(__dirname, "../Downloads"), { recursive: true });
  }

  xlsx.writeFile(workbook, errorFilePath);
  return errorFilePath;
};



const importEmployee = async (req, res) => {
  console.log("Import Employee");

  if (!req.file) {
    return Responses.errorResponse(req, res, "File is required");
  }
  console.log("File->", req.file);

  const filePath = req.file.path;
  try {
    const organizationId = req.params.organizationId;
    if (!organizationId) {
      return Responses.errorResponse(req, res, "Organization ID is required");
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Ensure `name` is included in transformed data
    const transformedData = sheetData.map(emp => ({
      empId: String(emp["Employee Id"]),
      name: emp["Name"] || "",
      email: emp["Email"],
      department: emp["Department Id"] || undefined,
      designation: emp["Designation Id"] || undefined,
      unitName: emp["Unit Id"] || undefined,
      organizationId: organizationId
    }));

    console.log("transformedData", transformedData);
    const { savedData, duplicateRecords, validationErrors } = await employeeService.importEmployee(transformedData, organizationId);
    fs.unlinkSync(filePath);


    console.log("validationErrors->", validationErrors)
    // if (duplicateRecords.length > 0) {
    //   const errorFilePath = writeErrorFile(duplicateRecords);
    //   const errorFileUrl = `${process.env.BASE_URL}Downloads/${path.basename(errorFilePath)}`;

    //   return Responses.failResponse(req, res, { errorFileUrl }, messages.importFailed, 200);
    // }


    if (duplicateRecords.length > 0 || validationErrors.length > 0) {
      const errorFilePath = writeErrorFile(duplicateRecords, validationErrors);
      const errorFileUrl = `${process.env.BASE_URL}Downloads/${path.basename(errorFilePath)}`

      return Responses.failResponse(
        req,
        res,
        { errorFileUrl },
        messages.importFailed,
        200
      );
    }

    return Responses.successResponse(req, res, savedData, messages.importSuccess, 200);
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Error during Excel import:", error.message);
    return Responses.errorResponse(req, res, error);
  }
};


// const importEmployee = async (req, res) => {
//   console.log("Import Employee");

//   if (!req.file) {
//     return Responses.errorResponse(req, res, "File is required");
//   }
//   console.log("File->", req.file);

//   const filePath = req.file.path;
//   try {
//     const organizationId = req.params.organizationId;
//     if (!organizationId) {
//       return Responses.errorResponse(req, res, "Organization ID is required");
//     }

//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     // Ensure `name` is included in transformed data
//     const transformedData = sheetData.map(emp => ({
//       empId: emp["Employee Id"],
//       name: emp["Name"] || "",  // Ensure name is included
//       email: emp["Email"],
//       department: emp["Department Id"] || undefined,
//       designation: emp["Designation Id"] || undefined,
//       unit: emp["Unit Id"] || undefined,
//       organizationId: organizationId
//     }));



//     console.log("transformedData", transformedData);
//     const { savedData, duplicateRecords, validationErrors } = await employeeService.importEmployee(transformedData, organizationId);
//     fs.unlinkSync(filePath);


//     console.log("validationErrors->", validationErrors)
//     // if (duplicateRecords.length > 0) {
//     //   const errorFilePath = writeErrorFile(duplicateRecords);
//     //   const errorFileUrl = `${process.env.BASE_URL}Downloads/${path.basename(errorFilePath)}`;

//     //   return Responses.failResponse(req, res, { errorFileUrl }, messages.importFailed, 200);
//     // }


//     if (duplicateRecords.length > 0 || validationErrors.length > 0) {
//       const errorFilePath = writeErrorFile(duplicateRecords, validationErrors);
//       const errorFileUrl = `${process.env.BASE_URL}Downloads/${path.basename(errorFilePath)}`

//       return Responses.failResponse(
//         req,
//         res,
//         { errorFileUrl },
//         messages.importFailed,
//         200
//       );
//     }

//     return Responses.successResponse(req, res, savedData, messages.importSuccess, 200);
//   } catch (error) {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//     console.error("Error during Excel import:", error.message);
//     return Responses.errorResponse(req, res, error);
//   }
// };

const viewProfile = async (req, res) => {
  try {
    const ip = req.headers.ip || (await commonHelper.getIp(req));
    const profilePicture = req.file;

    console.log("Uploaded File:", profilePicture);
    console.log("Request File:", req.body);

    const result = await employeeService.viewProfile(
      req.userId,
      req.params.id,
      req.body,
      ip,
      profilePicture
    );


    if (result.isMatch === false) {
      return Responses.failResponse(req, res, null, messages.CurrentPasswordIncorrect, 200);
    }


    if (result.error) {
      return Responses.failResponse(req, res, null, result.error, 200);
    }

    const message =
      req.body.isActive === true
        ? messages.active
        : req.body.isActive === false
          ? messages.deActive
          : messages.updateSuccess;

    console.log("Updated Profile Result:", result);

    return Responses.successResponse(req, res, result, message, 200);
  } catch (error) {
    console.error("Controller Error:", error);
    return Responses.errorResponse(req, res, error);
  }
};



module.exports = {
  createEmployee,
  editEmployee,
  deleteEmploye,
  listEmployee,
  viewSingleEmploye,
  masterData,
  masterDataXLSX,
  checkDuplicateUser,
  listOnlyEmployee,
  getEmployeeListAsPerUnit,
  importEmployee,
  writeErrorFile,
  viewProfile
};
