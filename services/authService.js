const Employee = require("../models/employeeModel");
const OtpLogs = require("../models/otpLogsModel");
const commonHelper = require("../helpers/commonHelper");
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const emailService = require("./emailService");
const authMiddleware = require("../middlewares/authMiddleware");
// const emailTemplates = require("../emailSetUp/emailTemplates");
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
const emailConstants = require("../constants/emailConstants");
const ObjectId = require("mongoose").Types.ObjectId;
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

const Organization = require("../models/organizationModel");
const BASE_URL = process.env.BASE_URL;

/**FUNC- TO VERIFY VALID EMAIL USER */
const verifyEmail = async (email) => {
  "----------------------33333", email;
  return await Employee.findOne(
    { email, isActive: true },
    { _id: 1, email: 1, organizationId: 1, name: 1 }
  );
};

/**FUNC- TO SEND OTP TO EMAIL USER */
const sendOtp = async (email, ipAddress) => {
  const userData = await verifyEmail(email);
  "userData------", userData;
  if (userData) {
    const logData = {
      moduleName: logMessages.authModule.moduleName,
      userId: userData._id,
      action: logMessages.authModule.sendOTP,
      ipAddress,
      details: `OTP sent to email <strong>${userData.email} </strong>`,
      organizationId: userData.organizationId,
    };
    "logData-------------------", logData;
    await logService.createLog(logData);
    return await validateSendingOtp(userData, "Send OTP");
  }
  return false;
};

/**FUNC- TO VERIFY VALID OTP OF USER */
const verifyOtp = async (data, ipAddress) => {
  const otpLogsData = await getOtpLogs(data);
  if (otpLogsData?.length !== 0) {
    const userData = otpLogsData[0]?.userDetail;
    const token = await authMiddleware.generateUserToken({
      userId: userData?._id,
      name: userData?.name,
    });
    const logData = {
      moduleName: logMessages.authModule.moduleName,
      userId: userData._id,
      action: logMessages.authModule.sendOTP,
      ipAddress,
      details: logMessages.authModule.signInByOTP,
      organizationId: userData.organizationId,
    };
    "logData-------------------", logData;
    await logService.createLog(logData);
    return {
      token,
      userData,
    };
  }
  return false;
};

/**FUNC- TO OTP LOGS DETAILS */
const getOtpLogs = async (data) => {
  let fromTime = new Date();
  fromTime.setMinutes(
    fromTime.getMinutes() - process.env.CHECK_OTP_VALIDATION_TIME
  ); // CHECK OTP VALIDATION WITH IN MINUTES
  "NOW--------------", fromTime;
  "CURRENT-----------", new Date();

  return await OtpLogs.aggregate([
    {
      $match: {
        email: data.email,
        otp: parseInt(data.otp),
        createdAt: {
          $gte: fromTime,
          $lt: new Date(),
        },
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "email",
        foreignField: "email",
        as: "userDetail",
      },
    },
    {
      $project: {
        _id: 1,
        email: 1,
        otp: 1,
        userDetail: {
          name: 1,
          _id: 1,
          email: 1,
          organizationId: 1,
          isMeetingOrganiser: 1,
        },
      },
    },
    { $unwind: "$userDetail" },
  ]);
};

/**FUNC- TO INSERT OTP DETAILS IN OTP LOGS */
const insertOtp = async (
  userData,
  otpResendCount = 0,
  otpResendTime = null,
  emailType
) => {
  const otpLogsUpdate = await OtpLogs.updateMany(
    {
      email: userData.email,
      organizationId: new ObjectId(userData.organizationId),
    },
    { isActive: false },
    { upsert: true }
  );
  "----------------otpLogsUpdate", otpLogsUpdate;
  const data = {
    otp: commonHelper.generateOtp(),
    email: userData.email,
    organizationId: userData.organizationId,
    expiryTime: commonHelper.otpExpiryTime(2), // 10 minutes
    otpResendCount,
    otpResendTime,
  };
  const otpData = new OtpLogs(data);
  await otpData.save();
  "-------------------------------1", userData, data.otp;
  const supportData = "support@ntspl.co.in";
  // const logo = process.env.LOGO;
  const organization = await Organization.findOne({
    _id: new ObjectId(userData.organizationId),
  });

  const logo = organization?.dashboardLogo
    ? `${BASE_URL}/${organization.dashboardLogo.replace(/\\/g, "/")}`
    : process.env.LOGO;

  const mailData = await emailTemplates.sendOtpEmailTemplate(
    userData,
    data.otp,
    process.env.CHECK_OTP_VALIDATION_TIME,
    supportData,
    logo
  );
  //const mailData = await emailTemplates.signInByOtpEmail(userData, data.otp);
  // const emailSubject = emailConstants.signInOtpsubject;
  const { emailSubject, mailData: mailBody } = mailData;

  "sendOtpEmailTemplate-----------------------maildata", mailData;
  await emailService.sendEmail(
    userData.email,
    emailType,
    emailSubject,
    mailBody
  );
  return data.otp;
};

/**FUNC- TO RESEND OTP  */
const reSendOtp = async (email, ipAddress) => {
  const userData = await verifyEmail(email);
  "userData-------------", userData;
  if (userData) {
    const logData = {
      moduleName: logMessages.authModule.moduleName,
      userId: userData._id,
      action: logMessages.authModule.reSendOTP,
      ipAddress,
      details: `OTP sent to email <strong>${userData.email} </strong>`,
      organizationId: userData.organizationId,
    };
    "logData-------------------", logData;
    await logService.createLog(logData);
    return await validateSendingOtp(userData, "Resend OTP");
  }
  return false;
};
// FUNCTION TO VALIDATE SENDING OTP
const validateSendingOtp = async (userData, emailType) => {
  let otpResendTime;
  let otpResendCount;
  const rulesData = await checkReSendOtpRules(userData);
  "rulesData-----------------", rulesData;
  if (rulesData?.isNewRecordCreated) {
    otpResendTime = new Date();
    otpResendCount = 1;

    "final user data-----------", userData;
    return {
      ...(await insertOtp(userData, otpResendCount, otpResendTime, emailType)),
      otpResendCount,
    };
  }

  if (rulesData?.isReSendOtpAllowed) {
    otpResendTime = rulesData.otpResendTime;
    otpResendCount = rulesData.otpResendCount;
    "final user data-----------", userData;
    return {
      ...(await insertOtp(userData, otpResendCount, otpResendTime, emailType)),
      otpResendCount,
    };
  }
  if (!rulesData.isReSendOtpAllowed) {
    return rulesData;
  }
};

/**FUNC- TO VERIFY SEND OTP RULES   */
const checkReSendOtpRules = async (userData) => {
  const otpLogsData = await OtpLogs.findOne({ email: userData.email }).sort({
    createdAt: -1,
  });
  "otpLogsData----------------", otpLogsData;
  if (otpLogsData) {
    let otpResendTime = otpLogsData.otpResendTime;
    let otpResendCount = otpLogsData.otpResendCount;
    "otpResendTime-----------------", otpResendTime;
    if (otpResendTime) {
      const timeDifference = commonHelper.checkTimeDifference(
        new Date(),
        otpResendTime
      );
      "=======================", timeDifference;
      "=======================", process.env.OTP_MAX_RESEND_TIMEINMINUTES;
      "=======================",
        timeDifference <= process.env.OTP_MAX_RESEND_TIMEINMINUTES;
      // if resend count is more than or equals to 3(max resend number)
      //&& time difference between current time & first resend attemt time is less than 3 hour
      if (
        otpResendCount == process.env.OTP_MAX_RESENDCOUNT &&
        timeDifference <= process.env.OTP_MAX_RESEND_TIMEINMINUTES
      ) {
        ("--------111");
        return {
          otpResendMaxTimeLimitCrossed: false,
          isReSendOtpAllowed: false,
          otpResendCount,
        };
      }
      // if resend count is less than  3(max resend number)
      //&& time difference between current time & first resend attemt time is less than 3 hour
      if (
        otpResendCount < process.env.OTP_MAX_RESENDCOUNT &&
        timeDifference <= process.env.OTP_MAX_RESEND_TIMEINMINUTES
      ) {
        ("--------222");
        return {
          otpResendMaxTimeLimitCrossed: false,
          otpResendCount: otpResendCount + 1,
          isReSendOtpAllowed: true,
          otpResendTime,
        };
      }

      // if resend count is less than  3(max resend number)
      //&& time difference between current time & first resend attemt time is greater than 3 hour
      if (
        otpResendCount <= process.env.OTP_MAX_RESENDCOUNT &&
        timeDifference >= process.env.OTP_MAX_RESEND_TIMEINMINUTES
      ) {
        ("--------333");
        otpResendCount++;
        return {
          otpResendMaxTimeLimitCrossed: true,
          otpResendCount: 0,
          otpResendTime: new Date(),
          isReSendOtpAllowed: true,
        };
      }
    } else {
      ("--------");
      return {
        isNewRecordCreated: true,
      };
    }
  }
  ("--------");
  return {
    isNewRecordCreated: true,
  };
};

/**FUNC- TO SET PASSWORD   */
const setPassword = async (data, ipAddress) => {
  const userData = await verifyEmail(data.email);
  if (userData) {
    const otpData = {
      email: data.email,
      otp: data.otp,
    };
    const isOtpVeified = await getOtpLogs(otpData);
    if (isOtpVeified.length !== 0) {
      const decrypPassword = await commonHelper.decryptWithAES(data.password);
      const hashedPassword = await commonHelper.generetHashPassword(
        decrypPassword
      );
      const logData = {
        moduleName: logMessages.authModule.moduleName,
        userId: userData._id,
        action: logMessages.authModule.setPassword,
        ipAddress,
        details: logMessages.authModule.setPasswordDetails,
        organizationId: userData.organizationId,
      };
      await logService.createLog(logData);

      return await Employee.updateOne(
        { email: data.email },
        { password: hashedPassword }
      );
    } else {
      return {
        isInValidOtp: true,
      };
    }
  }
  return false;
};

/**FUNC- FOR SIGN IN BY PASSWORD   */
const signInByPassword = async (data, ipAddress) => {
  const userData = await Employee.findOne(
    { email: data.email },
    {
      _id: 1,
      email: 1,
      organizationId: 1,
      name: 1,
      password: 1,
      isActive: 1,
      isMeetingOrganiser: 1,
    }
  );
  userData;
  if (!userData) {
    return false;
  }
  // Based on user Status
  if (!userData.isActive) {
    return {
      isUserDeactivated: true,
    };
  }
  if (userData.password == null) {
    return {
      isPasswordReset: true,
    };
  }
  "data.password------------------", data.password;
  const decrypPassword = await commonHelper.decryptWithAES(data.password);
  "decrypPassword------------------", decrypPassword;

  const passwordIsValid = await commonHelper.verifyPassword(
    decrypPassword,
    userData.password
  );

  if (!passwordIsValid) {
    return {
      incorrectPassword: true,
    };
  }

  const token = await authMiddleware.generateUserToken({
    userId: userData._id,
    name: userData.name,
  });
  delete userData.password;

  const logData = {
    moduleName: logMessages.authModule.moduleName,
    userId: userData._id,
    action: logMessages.authModule.sendOTP,
    ipAddress,
    details: logMessages.authModule.signInByPassword,
    organizationId: userData.organizationId,
  };

  "logData-------------------", logData;
  await logService.createLog(logData);

  return {
    token,
    userData: {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      organizationId: userData.organizationId,
      isMeetingOrganiser: userData.isMeetingOrganiser,
    },
  };
};
/**FUNC- TO SET PASSWORD FOR FORGOT PASSWORD   */
const forgotPassword = async (data, ipAddress) => {
  const userData = await verifyEmail(data.email);
  if (userData) {
    const otpData = {
      email: data.email,
      otp: data.otp,
    };
    const isOtpVeified = await getOtpLogs(otpData);
    if (isOtpVeified.length !== 0) {
      const decrypPassword = await commonHelper.decryptWithAES(data.password);
      const hashedPassword = await commonHelper.generetHashPassword(
        decrypPassword
      );
      const logData = {
        moduleName: logMessages.authModule.moduleName,
        userId: userData._id,
        action: logMessages.authModule.forgotPassword,
        ipAddress,
        details: logMessages.authModule.setPasswordDetails,
        organizationId: userData.organizationId,
      };
      await logService.createLog(logData);

      return await Employee.updateOne(
        { email: data.email },
        { password: hashedPassword }
      );
    } else {
      return {
        isInValidOtp: true,
      };
    }
  }
  return false;
};

/**FUNC- FOR SIGN IN BY PASSWORD   */
const loginByGmailCredentials = async (data, ipAddress) => {
  const { credential } = data;
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.CLIENT_ID_FOR_LOGIN,
  });
  const payload = ticket.getPayload();
  console.log("payload-----------------", payload);
  const { email, email_verified } = payload;
  if (email_verified) {
    const userData = await Employee.findOne(
      { email: email },
      {
        _id: 1,
        email: 1,
        organizationId: 1,
        name: 1,
        password: 1,
        isActive: 1,
        isMeetingOrganiser: 1,
      }
    );
    userData;
    if (!userData) {
      return false;
    }
    // Based on user Status
    if (!userData.isActive) {
      return {
        isUserDeactivated: true,
      };
    }

    const token = await authMiddleware.generateUserToken({
      userId: userData._id,
      name: userData.name,
    });
    delete userData.password;

    const logData = {
      moduleName: logMessages.authModule.moduleName,
      userId: userData._id,
      action: logMessages.authModule.sendOTP,
      ipAddress,
      details: logMessages.authModule.signInByPassword,
      organizationId: userData.organizationId,
    };

    "logData-------------------", logData;
    await logService.createLog(logData);

    return {
      token,
      userData: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        organizationId: userData.organizationId,
        isMeetingOrganiser: userData.isMeetingOrganiser,
      },
    };
  }
  return false;
};


/**FUNC- FOR SIGN IN BY PASSWORD   */
const loginByGmailAccessToken = async (data, ipAddress) => {
  const { access_token } = data;


  const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const user = response.data;
  console.log("User Info:", user);
  const { email, email_verified } = user;
  if (email_verified) {
    const userData = await Employee.findOne(
      { email: email },
      {
        _id: 1,
        email: 1,
        organizationId: 1,
        name: 1,
        password: 1,
        isActive: 1,
        isMeetingOrganiser: 1,
      }
    );
    userData;
    if (!userData) {
      return false;
    }
    // Based on user Status
    if (!userData.isActive) {
      return {
        isUserDeactivated: true,
      };
    }

    const token = await authMiddleware.generateUserToken({
      userId: userData._id,
      name: userData.name,
    });
    delete userData.password;

    const logData = {
      moduleName: logMessages.authModule.moduleName,
      userId: userData._id,
      action: logMessages.authModule.sendOTP,
      ipAddress,
      details: logMessages.authModule.signInByPassword,
      organizationId: userData.organizationId,
    };

    "logData-------------------", logData;
    await logService.createLog(logData);

    return {
      token,
      userData: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        organizationId: userData.organizationId,
        isMeetingOrganiser: userData.isMeetingOrganiser,
      },
    };
  }
  return false;
};

module.exports = {
  verifyEmail,
  sendOtp,
  verifyOtp,
  reSendOtp,
  setPassword,
  signInByPassword,
  forgotPassword,
  loginByGmailAccessToken,
  loginByGmailCredentials
};
