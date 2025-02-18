const commonHelper = require("../helpers/commonHelper");
//const emailTemplates = require("../emailSetUp/emailTemplates");
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
const emailService = require("./emailService");
const emailConstants = require("../constants/emailConstants");
const otpDemoLogs = require("../models/otpDemoLogsModel");
const otpContactUsLogs = require("../models/contactUsOtpLogs");
const DemoClient = require("../models/demoClientsSchema");
const contactUs = require("../models/contactUsModel");

const Organization = require("../models/organizationModel");
const BASE_URL = process.env.BASE_URL;

//FUCNTION TO CREATE DEPARTMENT
const createDemoClient = async (data, ipAddress) => {
  const isOtpVerified = await otpDemoLogs.findOne({
    email: data.email,
    isVerified: true,
    updatedAt: {
      $gte:
        new Date().getTime() -
        1000 * 60 * process.env.CHECK_OTP_VALIDATION_TIME,
    },
  });

  console.log("isOtpVerified-->", isOtpVerified)

  if (isOtpVerified) {
    const newData = {
      name: data.name,
      email: data.email,
      phoneNo: data.phoneNo,
      message: data.message,
      ipAddress,
    };
    const demoData = new DemoClient(newData);
    const result = await demoData.save();
    if (result) {
      // const logo = process.env.LOGO;
      const organization = await Organization.findOne({ email: data.email });
      const logo = organization?.dashboardLogo
      ? `${BASE_URL}/${organization.dashboardLogo.replace(/\\/g, "/")}` 
      : null;

      const emailType = "Demo Inquiry";
      const adminEmail = process.env.ADMIN_EMAIL;
     // const emailSubject = emailConstants.demoServeySubject(data.name);
      const mailData = await emailTemplates.sendDemoInquiryEmailTemplate(
        data.name,
        data.email,
        data.phoneNo,
        data.message,
        logo
      );
      await emailService.sendEmail(
        adminEmail,
        emailType,
        mailData.subject, 
        mailData.mailBody
      );
    }
    return result;
  } else {
    return {
      isOtpVerified: false,
    };
  }
};

const demoSendOtp = async (data, ipAddress) => {
  data;
  const name = data.name;
  const otp = await commonHelper.generateOtp();
  const email = data.email;
  const otpLogsData = await otpDemoLogs.findOne({
    email,
    updatedAt: {
      $gte:
        new Date().getTime() -
        1000 * 60 * process.env.CHECK_OTP_VALIDATION_TIME,
    },
  });
  const organization = await Organization.findOne({ email }); 
    const logo = organization?.dashboardLogo
    ? `${BASE_URL}/${organization.dashboardLogo.replace(/\\/g, "/")}` 
    : null;

  if (!otpLogsData) {
    const otpData = new otpDemoLogs({ otp, email });
    await otpData.save();
    const supportData = "support@ntspl.co.in";
    // const logo = process.env.LOGO;
    const emailType = "Send OTP";
    const emailSubject = emailConstants.organizationRegistrationOtpSubject;
    const typeMessage =
      data.type === "contactus"
        ? emailConstants.contactUsMessage
        : emailConstants.requestDemoOtpMessage;
    const mailData = await emailTemplates.sendOtpDemoEmailTemplate(
      commonHelper.convertFirstLetterOfFullNameToCapital(name),
      otp,
      process.env.CHECK_OTP_VALIDATION_TIME,
      supportData,
      logo,
      typeMessage
    );
    await emailService.sendEmail(email, emailType, mailData.subject, mailData.mailBody);
    return {
      data: {
        usedOtp: 1,
        totalOtp: 3,
      },
    };
  } else {
    if (otpLogsData.isVerified == true) {
      return {
        isOtpVerified: true,
        data: {
          usedOtp: 1,
          totalOtp: 3,
        },
      };
    }
    if (otpLogsData.otpCount == 3) {
      return {
        isMaxOtpSendOvered: true,
        data: {
          usedOtp: otpLogsData.otpCount,
          totalOtp: 3,
        },
      };
    }
    const updatedData = await otpDemoLogs.findByIdAndUpdate(
      { _id: otpLogsData._id },
      { otpCount: otpLogsData.otpCount + 1, otp },
      { new: true }
    );
    const supportData = "support@ntspl.co.in";
    // const logo = process.env.LOGO;
    const emailType = "Send OTP";
    const emailSubject =
      data.type === "contactus"
        ? emailConstants.contactUsOtpSubject
        : emailConstants.requestDemoOtpSubject;
    const typeMessage =
      data.type === "contactus"
        ? emailConstants.contactUsMessage
        : emailConstants.requestDemoOtpMessage;
    const mailData = await emailTemplates.sendOtpDemoEmailTemplate(
      commonHelper.convertFirstLetterOfFullNameToCapital(name),
      otp,
      process.env.CHECK_OTP_VALIDATION_TIME,
      supportData,
      logo,
      typeMessage
    );
    await emailService.sendEmail(email, emailType, emailSubject, mailData);
    return {
      data: {
        usedOtp: otpLogsData.otpCount + 1,
        totalOtp: 3,
      },
    };
  }
};

const validateSendingOtp = async (userData, emailType) => {
  let otpResendTime;
  let otpResendCount;
  const rulesData = await checkReSendOtpRules(userData);
  if (rulesData?.isNewRecordCreated) {
    otpResendTime = new Date();
    otpResendCount = 1;
    return {
      ...(await insertOtp(userData, otpResendCount, otpResendTime, emailType)),
      otpResendCount,
    };
  }

  if (rulesData?.isReSendOtpAllowed) {
    otpResendTime = rulesData.otpResendTime;
    otpResendCount = rulesData.otpResendCount;
    return {
      ...(await insertOtp(userData, otpResendCount, otpResendTime, emailType)),
      otpResendCount,
    };
  }
  if (!rulesData.isReSendOtpAllowed) {
    return rulesData;
  }
};

const verifyOtp = async (data) => {
  data;
  const { email, otp } = data;
  const otpLogsData = await otpDemoLogs.findOne({
    email,
    otp,
    updatedAt: {
      $gte:
        new Date().getTime() -
        1000 * 60 * process.env.CHECK_OTP_VALIDATION_TIME,
    },
  });
  if (!otpLogsData) {
    const checkOtpExist = await otpDemoLogs
      .find({
        email,
      })
      .sort({ _id: -1 })
      .limit(1);
    if (checkOtpExist.length == 0) {
      return {
        isOtpNotFound: true,
      };
    } else {
      if (parseInt(checkOtpExist[0].otp) !== parseInt(otp)) {
        return {
          wrongOtpFound: true,
        };
      } else {
        return {
          otpExpired: true,
        };
      }
    }
  }
  if (otpLogsData) {
    if (otpLogsData.isVerified == true) {
      return {
        isOtpVerified: true,
      };
    }
    await otpDemoLogs.findByIdAndUpdate(
      { _id: otpLogsData._id },
      { isVerified: true },
      { new: true }
    );
    return true;
  } else {
    ("Provided OTP does not match.");
    return false;
  }
};

const saveContactUsDetails = async (data, ipAddress) => {
  const isOtpVerified = await otpContactUsLogs.findOne({
    email: data.email,
    isVerified: true,
    updatedAt: {
      $gte:
        new Date().getTime() -
        1000 * 60 * process.env.CHECK_OTP_VALIDATION_TIME,
    },
  });
  if (isOtpVerified) {
    const newData = {
      name: data.name,
      email: data.email,
      phoneNo: data.phoneNo,
      message: data.message,
      ipAddress,
    };
    const contactUsData = new contactUs(newData);
    const result = await contactUsData.save();
    if (result) {
      // const logo = process.env.LOGO;
      const organization = await Organization.findOne({ email: data.email });
      const logo = organization?.dashboardLogo
        ? `${BASE_URL}/${organization.dashboardLogo.replace(/\\/g, "/")}`
        : process.env.LOGO;
      const emailType = "Contact Us";
      const adminEmail = process.env.ADMIN_EMAIL;
      // const emailSubject = emailConstants.contactUsSubject(data.name);
      const { subject, mailBody } = await emailTemplates.sendContactUsEmailTemplate(
        data.name,
        data.email,
        data.phoneNo,
        data.message,
        logo
      );
    await emailService.sendEmail(adminEmail, emailType, subject, mailBody);
    }
    return result;
  } else {
    return {
      isOtpVerified: false,
    };
  }
};

const contactUsSendOtp = async (data, ipAddress) => {
  data;
  const name = data.name;
  const otp = await commonHelper.generateOtp();
  const email = data.email;

  const otpLogsData = await otpContactUsLogs.findOne({
    email,
    updatedAt: {
      $gte:
        new Date().getTime() -
        1000 * 60 * process.env.CHECK_OTP_VALIDATION_TIME,
    },
  });

  const organization = await Organization.findOne({ email: data.email });
  const logo = organization?.dashboardLogo
    ? `${BASE_URL}/${organization.dashboardLogo.replace(/\\/g, "/")}`
    : process.env.LOGO;

  if (!otpLogsData) {
    const otpData = new otpContactUsLogs({ otp, email });
    await otpData.save();
    const supportData = "support@ntspl.co.in";
    // const logo = process.env.LOGO;
    const emailType = "Send OTP";
    // const emailSubject =
    //   data.type === "contactus"
    //     ? emailConstants.contactUsOtpSubject
    //     : emailConstants.requestDemoOtpSubject;
    const typeMessage =
      data.type === "contactus"
        ? emailConstants.contactUsMessage
        : emailConstants.requestDemoOtpMessage;
        const { subject, mailBody } = await emailTemplates.sendOtpContactEmailTemplate(
      commonHelper.convertFirstLetterOfFullNameToCapital(name),
      otp,
      process.env.CHECK_OTP_VALIDATION_TIME,
      supportData,
      logo,
      typeMessage
    );
    await emailService.sendEmail(email, emailType, subject, mailBody);
    return {
      data: {
        usedOtp: 1,
        totalOtp: 3,
      },
    };
  } else {
    if (otpLogsData.isVerified == true) {
      return {
        isOtpVerified: true,
        data: {
          usedOtp: 1,
          totalOtp: 3,
        },
      };
    }
    if (otpLogsData.otpCount == 3) {
      return {
        isMaxOtpSendOvered: true,
        data: {
          usedOtp: otpLogsData.otpCount,
          totalOtp: 3,
        },
      };
    }
    const updatedData = await otpContactUsLogs.findByIdAndUpdate(
      { _id: otpLogsData._id },
      { otpCount: otpLogsData.otpCount + 1, otp },
      { new: true }
    );
    const supportData = "support@ntspl.co.in";
    // const logo = process.env.LOGO;
    const emailType = "Send OTP";
    const emailSubject =
      data.type === "contactus"
        ? emailConstants.contactUsOtpSubject
        : emailConstants.requestDemoOtpSubject;
    const typeMessage =
      data.type === "contactus"
        ? emailConstants.contactUsMessage
        : emailConstants.requestDemoOtpMessage;
    const mailData = await emailTemplates.sendOtpDemoEmailTemplate(
      commonHelper.convertFirstLetterOfFullNameToCapital(name),
      otp,
      process.env.CHECK_OTP_VALIDATION_TIME,
      supportData,
      logo,
      typeMessage
    );
    await emailService.sendEmail(email, emailType, emailSubject, mailData);
    return {
      data: {
        usedOtp: otpLogsData.otpCount + 1,
        totalOtp: 3,
      },
    };
  }
};

const verifyContactUsOtp = async (data) => {
  data;
  const { email, otp } = data;
  const otpLogsData = await otpContactUsLogs.findOne({
    email,
    otp,
    updatedAt: {
      $gte:
        new Date().getTime() -
        1000 * 60 * process.env.CHECK_OTP_VALIDATION_TIME,
    },
  });
  console.log("otpLogsData->", otpLogsData)
  if (!otpLogsData) {
    const checkOtpExist = await otpContactUsLogs
      .find({
        email,
      })
      .sort({ _id: -1 })
      .limit(1);
    if (checkOtpExist.length == 0) {
      return {
        isOtpNotFound: true,
      };
    } else {
      if (parseInt(checkOtpExist[0].otp) !== parseInt(otp)) {
        return {
          wrongOtpFound: true,
        };
      } else {
        return {
          otpExpired: true,
        };
      }
    }
  }
  if (otpLogsData) {
    if (otpLogsData.isVerified == true) {
      return {
        isOtpVerified: true,
      };
    }
    await otpContactUsLogs.findByIdAndUpdate(
      { _id: otpLogsData._id },
      { isVerified: true },
      { new: true }
    );
    ("OTP verification successful.");
    return true;
  } else {
    ("Provided OTP does not match.");
    return false;
  }
};

module.exports = {
  createDemoClient,
  demoSendOtp,
  validateSendingOtp,
  verifyOtp,
  saveContactUsDetails,
  contactUsSendOtp,
  verifyContactUsOtp,
};
