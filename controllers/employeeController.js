const employeeService = require("../services/employeeService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const commonHelper = require("../helpers/commonHelper");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");

const columnMapping = {
  Name: "name",
  "Employee Id": "empId",
  Email: "email",
  Designation: "designation",
  Department: "department",
  "Unit Name": "unitName",
  "Unit Address": "unitAddress",
  "Admin": "isAdmin",
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

  const applyRedStyle = (value) => ({
    v: value || "",
    s: {
      fill: { fgColor: { rgb: "FF0000" } },
      font: { color: { rgb: "FFFFFF" } },
    },
  });

  const formatValidationErrors = validationErrors.map((error) => {
    const { organizationId, ...filteredData } = error.record || {};
    return {
      ...filteredData,
      "Reason for Failure": applyRedStyle(error.message),
    };
  });

  const formatDuplicateRecords = duplicateRecords.map((record) => {
    const { organizationId, ...filteredData } = record || {};
    return {
      ...filteredData,
      "Reason for Failure": applyRedStyle(messages.duplicateEntry),
    };
  });

  if (formatValidationErrors.length > 0) {
    const errorSheet = xlsx.utils.json_to_sheet(formatValidationErrors);
    xlsx.utils.book_append_sheet(workbook, errorSheet, messages.validationError);

    errorSheet["!cols"] = Object.keys(formatValidationErrors[0] || {}).map((key) => ({
      wpx: Math.max(
        ...formatValidationErrors.map((record) => {
          const cellValue = record[key]?.v || record[key] || "";
          return cellValue.toString().length;
        }),
        key.length
      ) * 10,
    }));
  }

  if (formatDuplicateRecords.length > 0) {
    const duplicateSheet = xlsx.utils.json_to_sheet(formatDuplicateRecords);
    xlsx.utils.book_append_sheet(workbook, duplicateSheet, "Duplicate Records");

    duplicateSheet["!cols"] = Object.keys(formatDuplicateRecords[0] || {}).map((key) => ({
      wpx: Math.max(
        ...formatDuplicateRecords.map((record) => {
          const cellValue = record[key]?.v || record[key] || "";
          return cellValue.toString().length;
        }),
        key.length
      ) * 10,
    }));
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
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  const filePath = req.file.path;
  try {
    const organizationId = req.params.organizationId;
    console.log("Org ID->", organizationId);

    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required in the request parameters." });
    }
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const transformedData = sheetData.map((row) => {
      const transformedRow = {};
      for (const [excelColumn, schemaField] of Object.entries(columnMapping)) {
        let value = row[excelColumn];
        if (schemaField === "isAdmin") {
          value = value?.toString().toLowerCase() === "yes";
        }
        transformedRow[schemaField] = value;
      }
      transformedRow.organizationId = organizationId;
      return transformedRow;
    });

    console.log("Transformed Data:", transformedData[0]);
    const { savedData, duplicateRecords, validationErrors } = await employeeService.importEmployee(transformedData);
    fs.unlinkSync(filePath);

    if (duplicateRecords.length > 0 || validationErrors.length > 0) {
      const errorFilePath = writeErrorFile(duplicateRecords, validationErrors);

      // return Responses.failResponse(
      //   req,
      //   res,
      //   { errorFileUrl: `/Downloads/${path.basename(errorFilePath)}` },
      //   messages.importFailed,
      //   200
      // );

      return res.status(200).json({
        message: "Import completed with errors.",
        errorFileUrl: `/Downloads/${path.basename(errorFilePath)}`,
      });

    }
    return Responses.successResponse(
      req,
      res,
      savedData,
      messages.importSuccess,
      200
    );
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Error during Excel import:", error.message);
    return Responses.errorResponse(req, res, error)
  }
};







module.exports = {
  createEmployee,
  editEmployee,
  deleteEmploye,
  listEmployee,
  viewSingleEmploye,
  masterData,
  checkDuplicateUser,
  listOnlyEmployee,
  getEmployeeListAsPerUnit,
  importEmployee,
  writeErrorFile
};
