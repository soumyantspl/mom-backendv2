const Designations = require("../models/designationModel");
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const commonHelper = require("../helpers/commonHelper");
//FUCNTION TO CREATE DESIGNATION
const createDesignationService = async (userId, data, ipAddress) => {
  const designationDetails = await checkDuplicate(
    data.organizationId,
    data.name
  );
  if (!designationDetails) {
    const result = new Designations({
      name: data.name,
      organizationId: new Object(data.organizationId),
    });
    ////////////////////LOGER START
    const logData = {
      moduleName: logMessages.Designation.moduleName,
      userId,
      action: logMessages.Designation.createDesignation,
      ipAddress,
      details:
        logMessages.Designation.createDesignationDetails +
        `<strong>${result.name}</strong>`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
    ///////////////////// LOGER END
    return await result.save();
  }
  return false;
};

//FUCNTION TO EDIT DESIGNATION
const editDesignationService = async (userId, id, data, ipAddress) => {
  const designationDetails = await checkDuplicate(
    data.organizationId,
    data.name
  );
  if (designationDetails) {
    if (
      designationDetails.name.toLowerCase() === data.name.toLowerCase() &&
      designationDetails._id.toString() !== id
    ) {
      return {
        isDuplicate: true,
      };
    } else if (
      designationDetails.name.toLowerCase() === data.name.toLowerCase() &&
      designationDetails._id.toString() == id
    ) {
      const result = await Designations.findByIdAndUpdate({ _id: id }, data);
      ////////////////////LOGER START
      const details = await commonHelper.generateLogObject(
        result,
        userId,
        data
      );
      if (details.length !== 0) {
        const logData = {
          moduleName: logMessages.Designation.moduleName,
          userId,
          action: logMessages.Designation.editDesignation,
          ipAddress,
          details: details.join(" , "),
          organizationId: result.organizationId,
        };
        await logService.createLog(logData);
      }
      /////////////////////// LOGER END
      return {
        isDuplicate: false,
      };
    } else {
      return {
        isDuplicate: false,
      };
    }
  } else {
    const result = await Designations.findByIdAndUpdate({ _id: id }, data);
    ////////////////////LOGER START
    const details = await commonHelper.generateLogObject(result, userId, data);
    if (details.length !== 0) {
      const logData = {
        moduleName: logMessages.Designation.moduleName,
        userId,
        action: logMessages.Designation.editDesignation,
        ipAddress,
        details: details.join(" , "),
        organizationId: result.organizationId,
      };
      await logService.createLog(logData);
    }
    ///////////////////// LOGER END
    return {
      isDuplicate: false,
    };
  }
};

//FUCNTION TO DELETE DESIGNATION
const deleteDesignationService = async (userId, data, ipAddress) => {
  const result = await Designations.findByIdAndUpdate(
    { _id: data.id },
    { isDelete: true },
    { new: true }
  );
  ////////////////////LOGER START
  const logData = {
    moduleName: logMessages.Designation.moduleName,
    userId,
    action: logMessages.Designation.deleteDesignation,
    ipAddress,
    details:
      logMessages.Designation.deleteDesignationDetails +
      `<strong>${result.name}</strong>`,
    organizationId: result.organizationId,
  };
  await logService.createLog(logData);
  /////////////////////LOGER END
  return result;
};
//FUCNTION TO LIST DESIGNATION
const listDesignationService = async (bodyData, queryData) => {
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
  const totalCount = await Designations.countDocuments(query);
  const designationList = await Designations.find(query)
    .sort({ createdAt: parseInt(order) })
    .limit(limit)
    .skip(skip);
  const formattedDesignationList = designationList.map((t) => {
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
    designationList: formattedDesignationList,
  };
};
const checkDuplicate = async (organizationId, name) => {
  const normalizedDesignationName = name.trim().toLowerCase();
  return await Designations.findOne(
    {
      organizationId,
      name: { $regex: `^${normalizedDesignationName}$`, $options: "i" },
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
  createDesignationService,
  editDesignationService,
  deleteDesignationService,
  listDesignationService,
};
