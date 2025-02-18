const Configuration = require("../models/configurationModel");
const WriteMinutesLimitationDays = require("../models/writeMinutesLimitationDays");
const ObjectId = require("mongoose").Types.ObjectId;
const logMessages = require("../constants/logsConstants");
const logService = require("./logsService");
const commonHelper = require("../helpers/commonHelper");
/**FUNC- EDIT CONFIGURATION */
const editConfig = async (data, id) => {
  const room = await Configuration.findByIdAndUpdate({ _id: id }, data, {
    new: true,
  });
  return room;
};
/**FUNC- TO VIEW CONFIGURATION */
const viewConfig = async (organizationId) => {
  organizationId;
  const result = await Configuration.findOne({
    organizationId: new ObjectId(organizationId),
  });
  return result;
};
/**FUNC- DELETE CONFIGURATION */
const deleteConfig = async (id) => {
  const config = await Configuration.findByIdAndUpdate(
    { _id: id },
    { isActive: false }
  );
  return config;
};
//Create or Update
// const createConfig = async (userId, data, ipAddress) => {
//   const {
//     organizationId,
//     acceptanceRejectionEndtime,
//     writeMinuteMaxTimeInHour,
//     draftMeetingCleanupDays, 
//   } = data;

//   console.log("IN createConfig");


//   const inputData = {
//     acceptanceRejectionEndtime,
//     writeMinuteMaxTimeInHour,
//     draftMeetingCleanupDays, 
//     isConfig: true,
//   };

//   console.log("Input Data:", inputData);


//   const existingConfig = await Configuration.findOne({ organizationId });

//   if (existingConfig) {
//     const updatedConfig = await Configuration.findOneAndUpdate(
//       { organizationId },
//       inputData, 
//       { new: true } 
//     );

//     console.log("Updated Config:", updatedConfig);

//     const details = await commonHelper.generateLogObjectForConfig(existingConfig, data);

//     if (details.length !== 0) {
//       const logData = {
//         moduleName: logMessages.Config.moduleName,
//         userId,
//         action: logMessages.Config.updateConfig,
//         ipAddress,
//         details: details.join(", "),
//         organizationId: existingConfig.organizationId,
//       };

//       console.log("Update Log Data:", logData);
//       await logService.createLog(logData);
//     }

//     return {
//       data: updatedConfig,
//       isUpdated: true, 
//     };
//   } else {
//     // Create a new configuration if none exists
//     const configData = new Configuration({ ...data, organizationId });
//     const result = await configData.save();

//     const logData = {
//       moduleName: logMessages.Config.moduleName,
//       userId,
//       action: logMessages.Config.createConfig,
//       ipAddress,
//       details: `Allow acceptance or rejection of meeting minutes <strong>${result.acceptanceRejectionEndtime} hours</strong>, allow write minutes within <strong>${result.writeMinuteMaxTimeInHour} hours</strong>, and cleanup drafts after <strong>${result.draftMeetingCleanupDays} days</strong>.`,
//       organizationId: result.organizationId,
//     };

//     console.log("New Config Log Data:", logData);
//     await logService.createLog(logData);

//     return {
//       data: result,
//       isUpdated: false, 
//     };
//   }
// };


const createConfig = async (userId, data, ipAddress) => {
  const {
    organizationId,
    acceptanceRejectionEndtime,
    writeMinuteMaxTimeInHour,
    draftMeetingCleanupDays,
  } = data;

  console.log("IN createConfig");

  const existingConfig = await Configuration.findOne({ organizationId });

  const draftMeetingReminderDays = existingConfig?.draftMeetingReminderDays ?? 0;
  
  const draftMeetingReminderDaysNum = Number(draftMeetingReminderDays);
  const draftMeetingCleanupDaysNum = Number(draftMeetingCleanupDays); 

  console.log("Fetched from DB - draftMeetingReminderDays:", draftMeetingReminderDaysNum);
  console.log("Received from Request - draftMeetingCleanupDays:", draftMeetingCleanupDaysNum);


  
  if (draftMeetingCleanupDaysNum <= draftMeetingReminderDaysNum + 1) {
    return {
      isDraftCleanupValid: true,
    };
  }

  const inputData = {
    acceptanceRejectionEndtime,
    writeMinuteMaxTimeInHour,
    draftMeetingCleanupDays,
    isConfig: true,
  };

  console.log("Input Data:", inputData);

  if (existingConfig) {
    const updatedConfig = await Configuration.findOneAndUpdate(
      { organizationId },
      inputData,
      { new: true }
    );

    console.log("Updated Config:", updatedConfig);

    return {
      data: updatedConfig,
      isUpdated: true,
    };
  } else {
    const configData = new Configuration({ ...data, organizationId });
    const result = await configData.save();

    return {
      data: result,
      isUpdated: false,
    };
  }
};








const fetchDaysOptionLimit = async () => {
  try {
    const result = await WriteMinutesLimitationDays.find();
    if (!result || result.length === 0) {
      return [];
    }
    const mappedResult = result.sort().map((item) => ({
      dayValue: item.dayValue,
      dayText: item.dayText,
    }));
    return mappedResult;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

module.exports = {
  editConfig,
  viewConfig,
  deleteConfig,
  createConfig,
  fetchDaysOptionLimit,
};
