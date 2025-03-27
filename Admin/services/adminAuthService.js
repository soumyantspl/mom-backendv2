const commonHelper = require("../../helpers/commonHelper");
//const emailTemplates = require("../emailSetUp/emailTemplates");
const emailTemplates = require("../../emailSetUp/dynamicEmailTemplate");
const emailService = require("../../services/emailService");
const emailConstants = require("../../constants/emailConstants");
const otpDemoLogs = require("../../models/otpDemoLogsModel");
const otpContactUsLogs = require("../../models/contactUsOtpLogs");
const DemoClient = require("../../models/demoClientsSchema");
const contactUs = require("../../models/contactUsModel");
const ObjectId = require("mongoose").Types.ObjectId;
const Organization = require("../../models/organizationModel");
const Employee = require ("../../models/employeeModel");
const AdminPanel = require("../models/adminPanelModel");
const authMiddleware = require("../../middlewares/authMiddleware");
const logService = require("../../services/logsService");
const logMessages = require("../../constants/logsConstants");
//const OtpLogs = require("../../models/otpLogsModel");
const adminOtpLogs = require("../models/adminOtpLogsModel");
//const authService = require("../services/authService")

const BASE_URL = process.env.BASE_URL;



/**FUNC- TO VERIFY VALID EMAIL USER */
const verifyEmail = async (email) => {
  "----------------------33333", email;
  return await AdminPanel.findOne(
    { email, isActive: true },
    { _id: 1, email: 1, name: 1 }
  );
};

/**FUNC- TO SEND OTP TO EMAIL USER */
const sendOtp = async (email, ipAddress) => {
  const userData = await verifyEmail(email);
  "userData------", userData;
  if (userData) {
    // const logData = {
    //   moduleName: logMessages.authModule.moduleName,
    //   userId: userData._id,
    //   action: logMessages.authModule.sendOTP,
    //   ipAddress,
    //   details: `OTP sent to email <strong>${userData.email} </strong>`,
    //  // organizationId: userData.organizationId,
    // };
    // "logData-------------------", logData;
   // await logService.createLog(logData);
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
    // const logData = {
    //   moduleName: logMessages.authModule.moduleName,
    //   userId: userData._id,
    //   action: logMessages.authModule.sendOTP,
    //   ipAddress,
    //   details: logMessages.authModule.signInByOTP,
    //   organizationId: userData.organizationId,
    // };
    // "logData-------------------", logData;
    // await logService.createLog(logData);
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

  return await adminOtpLogs.aggregate([
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
        from: "adminpanels",
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
         // organizationId: 1,
        //  isMeetingOrganiser: 1,
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
  // const otpLogsUpdate = await adminOtpLogs.updateMany(
  //   {
  //     email: userData.email,
  //   //  organizationId: new ObjectId(userData.organizationId),
  //   },
  //   { isActive: false },
  //   { upsert: true }
  // );
  // "----------------otpLogsUpdate", otpLogsUpdate;
  const data = {
    otp: commonHelper.generateOtp(),
    email: userData.email,
   // organizationId: userData.organizationId,
    expiryTime: commonHelper.otpExpiryTime(2), // 10 minutes
    otpResendCount,
    otpResendTime,
  };
  const otpData = new adminOtpLogs(data);
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
  const otpLogsData = await adminOtpLogs.findOne({ email: userData.email }).sort({
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



// const loginByPassword = async (bodyData) => {
//     const { email, password } = bodyData;

   
//     const user = await AdminPanel.findOne({ email });

//     console.log("User Found:", user); 

    
//     if (!user) {
//         return false; 
//     }

//     const decrypPassword = await commonHelper.decryptWithAES(password);
//    const passwordIsValid = await commonHelper.verifyPassword(decrypPassword, user.password);
   
//     if (!passwordIsValid) {
//         return "invalidPassword"; 
//     }
//     const token = await authMiddleware.generateUserToken({
//         userId: user._id,
//         name: user.name,
//       });
//       delete user.password;
//     return {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         token,
//     };
// };


const loginByPassword = async (bodyData) => {
  const { email, password } = bodyData;

  
  const userData = await AdminPanel.findOne({ email });

  console.log("User Found:", userData);

  if (!userData) {
      return false; 
  }

  
  const adminPanelUser = await AdminPanel.findOne({ email });
  const adminPanelPassword = adminPanelUser ? adminPanelUser.password : null;

  if (!adminPanelPassword) {
      console.error("Admin panel password not found!");
      return "serverError";
  }

  
   const decryptedPassword = await commonHelper.decryptWithAES(password);
  // const passwordIsValid =
  //     password === adminPanelPassword || // Match with admin panel password
  //     (await commonHelper.verifyPassword(password, userData.decryptedPassword)); // Match with user's hashed password
      const passwordIsValid = await commonHelper.verifyPassword(decryptedPassword, userData.password);
  if (!passwordIsValid) {
      return "invalidPassword";
  }

  
  const token = await authMiddleware.generateUserToken({
      userId: userData._id,
      name: userData.name,
  });

await AdminPanel.updateOne({ email }, { $set: { token } });
  delete userData.password;

  return {
    token,
    userData:{
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      isSuperAdmin: userData.isSuperAdmin,
    },
  };
};



// const setPassword = async (bodyData) => {
//     const { email, newPassword } = bodyData;

    
//     const user = await AdminPanel.findOne({ email });

//     if (!user) {
//         return false; 
//     }

//     const hashedPassword = await commonHelper.generetHashPassword(newPassword);
//     user.password = hashedPassword;
//     await user.save();

//     return true; 
// };

const setPassword = async (bodyData) => {
  const { email, password ,otp} = bodyData;
  const user = await AdminPanel.findOne({ email });

  if (user) {

      const otpData = {
          email: email,
          otp: otp,
      };
     // const isOtpVerified = await getOtpLogs(otpData);
     const isOtpVerified = await getOtpLogs(otpData);
  
      if (isOtpVerified.length !== 0) {
         
      const decryptedPassword = await commonHelper.decryptWithAES(password);
          console.log("Decrypted Password---",decryptedPassword);
      
      const hashedPassword = await commonHelper.generetHashPassword(decryptedPassword);
  
      // // Log the password change event
      // const logData = {
      //     moduleName: logMessages.authModule.moduleName,
      //     userId: user._id,
      //     action: logMessages.authModule.setPassword,
      //     ipAddress,
      //     details: logMessages.authModule.setPasswordDetails,
      //     organizationId: user.organizationId,
      // };
      // await logService.createLog(logData);
  
    //  user.password = newPassword;
      user.password = hashedPassword;
      await user.save();
      return true;
      }
  
      return { isInValidOtp: true };

  }

  return false;
 
};


const addAdmin = async (bodyData) => {
    const { name, email, password } = bodyData;

    
    const existingAdmin = await AdminPanel.findOne({ email });
    if (existingAdmin) {
        return  null ;
    }

    const hashedPassword = await commonHelper.generetHashPassword(password);

    const newAdmin = new AdminPanel({ name, email, password: hashedPassword });

    const savedAdmin = await newAdmin.save();

    return  savedAdmin ;
};






  module.exports = {

    loginByPassword,
    setPassword,
    addAdmin,
    verifyEmail,
    sendOtp,
    verifyOtp,
    reSendOtp,
  };
