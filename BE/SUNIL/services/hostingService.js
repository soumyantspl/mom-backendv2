const commonHelper = require("../helpers/commonHelper");
const emailTemplates = require("../emailSetUp/emailTemplates");
const emailService = require("./emailService");
const emailConstants = require("../constants/emailConstants");
const HostingDetails = require("../models/hostingDetailsModel");
const otpContactUsLogs = require("../models/contactUsOtpLogs");
const DemoClient = require("../models/demoClientsSchema");
const contactUs = require("../models/contactUsModel");
const ObjectId = require("mongoose").Types.ObjectId;
const axios = require("axios");

/**FUNC- UPDATE HOST DETAILS */
const updateHostDetails = async (organizationId, data, userId, ipAddress) => {
  console.log("organizationId-------------", organizationId,data);
  const hostDetails = {
    hostType: data.hostType,
    organizationId,
  };
  if (data.hostType === "ZOOM") {
    hostDetails["zoomCredentials"] = {
      clientId: data.clientId,
      secretToken: data.secretToken,
      accountId: data.accountId,
      hostKey: data.hostKey,
    };

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${commonHelper.decryptWithAES(data.accountId)}`,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: commonHelper.decryptWithAES(data.clientId),
        password: commonHelper.decryptWithAES(data.secretToken),
      },
    };

    const authResponse = await axios.request(config);
    console.log(
      "authResponse=====================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
      authResponse
    );
 
  }

  if (data.hostType === "GMEET") {
    hostDetails["gMeetCredentials"] = {
      clientId: data.gclientId,
      secretToken: data.gsecretToken,
    };
  }
  if (data.hostType === "MSTEAMS") {
    hostDetails["msTeamCredentials"] = {
      clientId: data.mclientId,
      secretToken: data.msecretToken,
      accountId: data.maccountId,
    };
  }
  console.log("hostDetails==========", hostDetails);

  const result = await HostingDetails.findOneAndUpdate(
    {
      organizationId: organizationId,
    },
    hostDetails,
    { upsert: true, new: true }
  );
  console.log("result---------------", result);
  // if (result) {
  //   ////////////////////LOGER START
  //   const logData = {
  //     moduleName: logMessages.Action.moduleName,
  //     userId,
  //     action: logMessages.Action.completeAction,
  //     ipAddress,
  //     details:
  //       "Action completed by <strong>" +
  //       commonHelper.convertFirstLetterOfFullNameToCapital(
  //         assignedUserDetail?.name
  //       ) +
  //       " (" +
  //       assignedUserDetail?.email +
  //       ") </strong>",
  //     subDetails: `
  //     Action : ${result?.description}</br>
  //     Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
  //     organizationId: result?.organizationId,
  //   };
  //   "logData-------------------", logData;
  //   await logService.createLog(logData);
  /////////////////// LOGER END
  // }
  return result;
};

const getHostDetails = async (organizationId) => {
  console.log("organizationId============", organizationId);
  return await HostingDetails.findOne({
    organizationId,
    isActive: true,
  });
};

/**FUNC- UPDATE HOST STATUS */
const updateHostStatus = async (organizationId, data, userId, ipAddress) => {
  console.log("organizationId-------------", organizationId, data);
  let hostDetails = {};
  if (data.hostType === "ZOOM") {
    hostDetails["zoomCredentials.isActive"] = data.isActive;
  }

  if (data.hostType === "GMEET") {
    hostDetails["gMeetCredentials"]["isActive"] = data.isActive;
  }
  if (data.hostType === "MSTEAMS") {
    hostDetails["msTeamCredentials"]["isActive"] = data.isActive;
  }
  console.log("hostDetails==========", hostDetails);
  const result = await HostingDetails.findOneAndUpdate(
    {
      organizationId: organizationId,
    },
    hostDetails,
    { upsert: true, new: true }
  );
  console.log("result---------------", result);
  // if (result) {
  //   ////////////////////LOGER START
  //   const logData = {
  //     moduleName: logMessages.Action.moduleName,
  //     userId,
  //     action: logMessages.Action.completeAction,
  //     ipAddress,
  //     details:
  //       "Action completed by <strong>" +
  //       commonHelper.convertFirstLetterOfFullNameToCapital(
  //         assignedUserDetail?.name
  //       ) +
  //       " (" +
  //       assignedUserDetail?.email +
  //       ") </strong>",
  //     subDetails: `
  //     Action : ${result?.description}</br>
  //     Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
  //     organizationId: result?.organizationId,
  //   };
  //   "logData-------------------", logData;
  //   await logService.createLog(logData);
  /////////////////// LOGER END
  // }
  return result;
};
module.exports = {
  updateHostDetails,
  getHostDetails,
  updateHostStatus,
};
