const mongoose = require("mongoose");
const Configuration = require("../models/configurationModel");
const Config = require("../models/configurationModel");
const logMessages = require("../constants/logsConstants");
const logService = require("./logsService");
const commonHelper = require("../helpers/commonHelper");
const ObjectId = require("mongoose").Types.ObjectId;


const createAlert = async (userId, data, ipAddress = "1000") => {
  const { organizationId, mettingReminders, chaseOfAction, draftMeetingReminderDays } = data;

  const existingAlert = await Config.findOne({ organizationId: new ObjectId(organizationId) });

  if (!existingAlert) {
    const alertData = new Config({
      ...data, // Include draftMeetingReminderDays in the new alert data
    });
    const newAlert = await alertData.save();

    const logData = {
      moduleName: logMessages.Alert.moduleName,
      userId,
      action: logMessages.Alert.createAlert,
      ipAddress,
      details: `Meeting Reminder set to <strong>${newAlert.mettingReminders.hours} hour(s)</strong> & <strong>${newAlert.mettingReminders.minutes} minute(s)</strong>. Chase of Action set to <strong>${newAlert.chaseOfAction}</strong>. Draft Meeting Reminder set to <strong>${newAlert.draftMeetingReminderDays} day(s)</strong>.`,
      organizationId: newAlert.organizationId,
    };

    await logService.createLog(logData);

    return {
      data: newAlert,
      isUpdated: false,
    };
  }

  let logDetails = [];

  if (
    existingAlert.mettingReminders.hours !== mettingReminders.hours ||
    existingAlert.mettingReminders.minutes !== mettingReminders.minutes
  ) {
    logDetails.push(
      `Meeting Reminder changed from <strong>${existingAlert.mettingReminders.hours} hour(s) ${existingAlert.mettingReminders.minutes} minute(s)</strong> to <strong>${mettingReminders.hours} hour(s) ${mettingReminders.minutes} minute(s)</strong>`
    );
  }

  if (existingAlert.chaseOfAction !== chaseOfAction) {
    logDetails.push(`Chase of Action changed from <strong>${existingAlert.chaseOfAction} days</strong> to <strong>${chaseOfAction} days</strong>`);
  }

  if (existingAlert.draftMeetingReminderDays !== draftMeetingReminderDays) {
    logDetails.push(`Draft Meeting Reminder changed from <strong>${existingAlert.draftMeetingReminderDays} day(s)</strong> to <strong>${draftMeetingReminderDays} day(s)</strong>`);
  }

  const updatedAlert = await Config.findOneAndUpdate(
    { organizationId: new ObjectId(organizationId) },
    {
      mettingReminders,
      chaseOfAction,
      draftMeetingReminderDays, 
    },
    { new: true }
  );

  if (logDetails.length > 0) {
    const logData = {
      moduleName: logMessages.Alert.moduleName,
      userId,
      action: logMessages.Alert.updateAlert,
      ipAddress,
      details: logDetails.join(', '),
      organizationId: updatedAlert.organizationId,
    };
    await logService.createLog(logData);
  }

  return { data: updatedAlert, isUpdated: true };
};





const viewAlert = async () => {
  const result = await Configuration.findOne({
    isActive: true,
  });
  return result;
};

module.exports = {
  createAlert,
  viewAlert,
};
