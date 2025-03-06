const Roles = require("../models/rolesModel");
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- CREATE ROLE */
const createRole = async (userId, data, ipAddress = "1000") => {
  console.log("----------------------33333", data);
  const roleDetails = await checkDuplicateEntry(data.name, data.organizationId);
  console.log("roleDetails--------------", roleDetails);
  if (!roleDetails) {
    const inputData = {
      name: data.name,
      organizationId: data.organizationId,
      permission: data.permission,
    };
    const roleData = new Roles(inputData);
    const result = await roleData.save();
    ////////////////////LOGER START
    console.log("result------------>", result);
    const logData = {
      moduleName: logMessages.Roles.moduleName,
      userId,
      action: logMessages.Roles.createUnit,
      ipAddress,
      details: logMessages.Roles.createRoleDetails.concat(
        result.organizationId
      ),
      organizationId: result.organizationId,
    };
    console.log("logData-------------------", logData);
    await logService.createLog(logData);
    ///////////////////// LOGER END
    return result;
  }

  return false;
};

/**FUNC- TO VERIFY DUPLICATE ROOM */
const checkDuplicateEntry = async (name, organizationId) => {
  return await Roles.findOne(
    { name, organizationId, isActive: true },
    { _id: 1, name: 1, organizationId: 1 }
  );
};

/**FUNC- UPDATE ROLE */
const updateRole = async (userId, id, data, ipAddress = "1000") => {
  let roleDetails;
  if (data.name) {
    roleDetails = await checkDuplicateEntry(data.name, data.organizationId);
  }
  if (!roleDetails) {
    const result = await Roles.findByIdAndUpdate({ _id: id }, data, {
      new: false,
    });
    console.log("role-----------------------", result);
    ////////////////////LOGER START
    const inputKeys = Object.keys(data);
    const details = await commonHelper.generateLogObject(
      inputKeys,
      result,
      userId,
      data
    );
    const logData = {
      moduleName: logMessages.Roles.moduleName,
      userId,
      action: logMessages.Roles.editRole,
      ipAddress,
      details: details.join(" , "),
      organizationId: result.organizationId,
    };
    console.log("logData-------------------", logData);
    await logService.createLog(logData);
    ///////////////////// LOGER END
    return result;
  }

  return {
    isDuplicateName: true,
  };
};

/**FUNC- VIEW ROLE */
const viewRole = async (data) => {
  const result = await Roles.find({ organizationId: data.organizationId }, {});
  console.log("role--->", data);
  return result;
};

const deleteRole = async (userId, id, data, ipAddress = "1000") => {
  console.log("IDDDDDDDDD", id);
  const result = await Roles.findByIdAndUpdate(
    { _id: id },
    { isActive: false },
    { new: true }
  );
  console.log("role--->", result);
  ////////////////////LOGER START
  const logData = {
    moduleName: logMessages.Roles.moduleName,
    userId,
    action: logMessages.Roles.deleteRole,
    ipAddress,
    details: result.organizationId + logMessages.Roles.deleteRole,
    organizationId: result.organizationId,
  };
  console.log("logData-------------------", logData);
  await logService.createLog(logData);
  ///////////////////// LOGER END
  return result;
};

module.exports = {
  createRole,
  updateRole,
  viewRole,
  deleteRole,
};
