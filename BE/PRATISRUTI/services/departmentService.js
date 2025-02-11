const Department = require("../models/departmentModel");
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const commonHelper = require("../helpers/commonHelper");
//FUCNTION TO CREATE DEPARTMENT
const createDepartmentService = async (userId, data, ipAddress) => {
  const departmentDetails = await checkDuplicate(
    data.organizationId,
    data.name
  );
  if (!departmentDetails) {
    const newDepartment = new Department({
      name: data.name,
      organizationId: data.organizationId,
    });
    const inputKeys = Object.keys(newDepartment);
    const logData = {
      moduleName: logMessages.Department.moduleName,
      userId,
      action: logMessages.Department.createDepartment,
      ipAddress,
      details: logMessages.Department.createDepartmentDetails + `<strong>${data.name}</strong>`,
      organizationId: data.organizationId,
    };
    await logService.createLog(logData);
    return await newDepartment.save();
  }
  return false;
};
//FUCNTION TO EDIT DEPARTMENT
const editDepartmentService = async (userId, id, data, ipAddress) => {
  userId, data;
  const departmentDetails = await checkDuplicate(
    data.organizationId,
    data.name
  );
  if (departmentDetails) {
    if (
      departmentDetails.name.toLowerCase() === data.name.toLowerCase() &&
      departmentDetails._id.toString() !== id
    ) {
      return {
        isDuplicate: true,
      };
    } else if (
      departmentDetails.name.toLowerCase() === data.name.toLowerCase() &&
      departmentDetails._id.toString() == id
    ) {
      const result = await Department.findByIdAndUpdate({ _id: id }, data, {
        new: false,
      });
      const details = await commonHelper.generateLogObjectDepartment(
        result,
        userId,
        data
      );
      if (details.length !== 0) {
        const logData = {
          moduleName: logMessages.Department.moduleName,
          userId,
          action: logMessages.Department.editDepartment,
          ipAddress,
          details: details.join(" , "),
          organizationId: result.organizationId,
        };
        "logData-------------------", logData;
        await logService.createLog(logData);
      }
      return {
        isDuplicate: false,
      };
    } else {
      return {
        isDuplicate: false,
      };
    }
  } else {
    const result = await Department.findByIdAndUpdate({ _id: id }, data, {
      new: false,
    });
    const details = await commonHelper.generateLogObjectDepartment(result, userId, data);
    if (details.length !== 0) {
      const logData = {
        moduleName: logMessages.Department.moduleName,
        userId,
        action: logMessages.Department.editDepartment,
        ipAddress,
        details: details.join(" , "),
        organizationId: result.organizationId,
      };
      await logService.createLog(logData);
    }
    return {
      isDuplicate: false,
    };
  }
};
//FUCNTION TO CHECK
const existingDepartmentService = async (organizationId) => {
  const isExist = await Department.findById(organizationId);
  return isExist;
};
////FUCNTION TO DELETE DEPARTMENT
const deleteDepartmentService = async (
  userId,
  data,
  ipAddress,
  organizationId
) => {
  const result = await Department.findByIdAndUpdate(
    { _id: data.id },
    { isDelete: true },
    { new: true }
  );
  ////////////////////LOGER START
  const logData = {
    moduleName: logMessages.Department.moduleName,
    userId,
    action: logMessages.Department.deleteDepartment,
    ipAddress,
    details: logMessages.Department.deleteDetails + `<strong>${result.name}</strong>`,
    organizationId: organizationId,
  };
  await logService.createLog(logData);
  ///////////////////// LOGER END
  return result;
};
//FUCNTION TO LIST DEPARTMENT
const listDepartmentService = async (bodyData, queryData) => {
  const { order } = queryData;
  const { organizationId, searchKey, updatedAt } = bodyData;
  let query = {
    organizationId,
    isActive: true,
    isDelete: false,
  };
  if (searchKey) {
    query.name = { $regex: searchKey, $options: "i" };
  }
  if (updatedAt) {
    query.updatedAt = updatedAt;
  }
  const limit = parseInt(queryData.limit);
  const skip = (parseInt(queryData.page) - 1) * limit;
  const totalCount = await Department.countDocuments(query);
  const departmentList = await Department.find(query)
    .sort({ createdAt: parseInt(order) })
    .limit(limit)
    .skip(skip);
  const formattedDepartmentList = departmentList.map((t) => {
    const { formattedTime, formattedDate } = commonHelper.formatDateTimeFormat(
      t.updatedAt
    );
    return {
      ...t.toObject(),
      formattedDate: formattedDate,
      formattedTime: formattedTime,
    };
  });
  return {
    totalCount,
    departmentList: formattedDepartmentList,
  };
};
const checkDuplicate = async (organizationId, name) => {
  const normalizedDepartmentName = name.trim().toLowerCase();
  return await Department.findOne(
    {
      organizationId,
      name: { $regex: `^${normalizedDepartmentName}$`, $options: "i" },
      isActive: true,
      isDelete: false,
    },
    {
      organizationId: 1,
      name: 1,
    }
  );
};

module.exports = {
  createDepartmentService,
  editDepartmentService,
  existingDepartmentService,
  deleteDepartmentService,
  listDepartmentService,
};
