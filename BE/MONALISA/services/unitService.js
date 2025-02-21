const Units = require("../models/unitModel");
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const commonHelper = require("../helpers/commonHelper");

const createUnit = async (userId, data, ipAddress) => {
  const unitDetails = await checkDuplicate(data.organizationId, data.name);
  if (!unitDetails) {
    const newData = {
      name: data.name,
      address: data.address,
      organizationId: data.organizationId,
    };
    const unitData = new Units(newData);
    const result = await unitData.save();
    ////////////////////LOGER START
    const logData = {
      moduleName: logMessages.Unit.moduleName,
      userId,
      action: logMessages.Unit.createUnit,
      ipAddress,
      details: "Unit Name: " + `<strong>${data.name}</strong>`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
    ///////////////////// LOGER END
    return result;
  }
  return false;
};

const editUnit = async (userId, id, data, ipAddress) => {

  const unitDetails = await checkDuplicate(data.organizationId, data.name);
  if (unitDetails) {
    if (
      unitDetails.name.toLowerCase() === data.name.toLowerCase() &&
      unitDetails._id.toString() !== id
    ) {
      return {
        isDuplicate: true,
      };
    } else if (
      unitDetails.name.toLowerCase() === data.name.toLowerCase() &&
      unitDetails._id.toString() == id
    ) {
      const result = await Units.findByIdAndUpdate({ _id: id }, data, {
        new: false,
      });
      ////////////////////LOGER START
      const details = await commonHelper.generateLogObject(
        result,
        userId,
        data
      );
      if (details.length !== 0) {
        let logData
        if (data.isActive === true) {
          logData = {
            moduleName: logMessages.Unit.moduleName,
            userId,
            action: logMessages.Unit.unitStatus,
            ipAddress,
            details: `Unit <strong>${result.name}</strong> is Activated`,
            organizationId: result.organizationId,
          };
        } else if (data.isActive === false) {
          logData = {
            moduleName: logMessages.Unit.moduleName,
            userId,
            action: logMessages.Unit.unitStatus,
            ipAddress,
            details: `Unit <strong>${result.name}</strong> is Deactivated`,
            organizationId: result.organizationId,
          };
        }
        else {
          logData = {
            moduleName: logMessages.Unit.moduleName,
            userId,
            action: logMessages.Unit.updateUnit,
            ipAddress,
            details: details.join(" , ") + ("of Unit ") + `<strong>${data.name}</strong>`,
            organizationId: result.organizationId,
          };
        }
        await logService.createLog(logData);
      }
      return {
        data: result,
      };
    } else {
      return {
        isDuplicate: false,
      };
    }
  } else {
    const result = await Units.findByIdAndUpdate({ _id: id }, data, {
      new: false,
    });
    ////////////////////LOGER START
    const details = await commonHelper.generateLogObject(result, userId, data);
    if (details.length !== 0) {
      let logData
      if (data.isActive === true) {
        logData = {
          moduleName: logMessages.Unit.moduleName,
          userId,
          action: logMessages.Unit.unitStatus,
          ipAddress,
          details: `Unit <strong>${result.name}</strong> is Activated`,
          organizationId: result.organizationId,
        };
      } else if (data.isActive === false) {
        logData = {
          moduleName: logMessages.Unit.moduleName,
          userId,
          action: logMessages.Unit.unitStatus,
          ipAddress,
          details: `Unit <strong>${result.name}</strong> is Deactivated`,
          organizationId: result.organizationId,
        };
      }
      else {
        logData = {
          moduleName: logMessages.Unit.moduleName,
          userId,
          action: logMessages.Unit.updateUnit,
          ipAddress,
          details: details.join(" , "),
          organizationId: result.organizationId,
        };
      }
      await logService.createLog(logData);
    }
    ///////////////////// LOGER END
    return {
      isDuplicate: false,
    };
  }
};

const deleteUnit = async (userId, id, ipAddress) => {
  const result = await Units.findByIdAndUpdate(
    { _id: id },
    { isDelete: true },
    { new: false }
  );
  ////////////////////LOGER START
  const logData = {
    moduleName: logMessages.Unit.moduleName,
    userId,
    action: logMessages.Unit.deleteUnit,
    ipAddress,
    details: logMessages.Unit.detailsdeleteUnit + `<strong>${result.name}</strong>`,
    organizationId: result.organizationId,
  };
  await logService.createLog(logData);
  ///////////////////// LOGER END
  return result;
};
const listAllUnitForMeeting = async (userId, bodyData, queryData) => {
  const { organizationId } = bodyData;
  let query = {
    organizationId,
    isActive: true,
    isDelete: false,
  };
  const totalCount = await Units.countDocuments(query);
  const unitData = await Units.find(query);
  const formattedUnitData = unitData.map((t) => {
    const { formattedTime, formattedDate } = commonHelper.formatDateTimeFormat(
      t.updatedAt
    );
    return {
      ...t.toObject(),
      formattedDate: formattedDate,
      formattedTime: formattedTime,
    };
  });
  return { totalCount, unitData: formattedUnitData };
};

const listUnit = async (userId, bodyData, queryData) => {
  const { organizationId, searchKey, updatedAt } = bodyData;
  const { order } = queryData;
  let query = searchKey
    ? {
      organizationId,
      name: { $regex: searchKey, $options: "i" },
      isDelete: false,
    }
    : {
      organizationId,
      isDelete: false,
    };
  if (updatedAt) {
    query.updatedAt = updatedAt;
  }

  const limit = parseInt(queryData.limit);
  const skip = (parseInt(queryData.page) - 1) * parseInt(limit);

  const totalCount = await Units.countDocuments(query);
  const unitData = await Units.find(query)
    .sort({ createdAt: parseInt(order) })
    .limit(limit)
    .skip(skip);

  const formattedUnitData = unitData.map((t) => {
    const { formattedTime, formattedDate } = commonHelper.formatDateTimeFormat(
      t.updatedAt
    );
    return {
      ...t.toObject(),
      formattedDate: formattedDate,
      formattedTime: formattedTime,
    };
  });

  return { totalCount, unitData: formattedUnitData };
};

const checkDuplicate = async (organizationId, name) => {
  const normalizedUnitName = name?.trim().toLowerCase();

  return await Units.findOne(
    {
      organizationId,
      name: { $regex: `^${normalizedUnitName}$`, $options: "i" },
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
  createUnit,
  editUnit,
  deleteUnit,
  listUnit,
  listAllUnitForMeeting,
};
