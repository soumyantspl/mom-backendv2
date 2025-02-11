const { transporter, mailOptions } = require("../emailSetUp/mailSetup");
const emailTemplates = require("../emailSetUp/emailTemplates");
const emailConstants = require("../constants/emailConstants");
const EmailLogs = require("../models/emailLogsModel");
/**FUNC- TO SEND  OTP TO EMAIL USER */
const sendSignInOtpEmail = async (userData, otp, emailType) => {
  const maildata = await emailTemplates.sendOtpEmailTemplate(userData, otp);
  const mailOptionsInfo = {
    from: mailOptions.from,
    to: userData.email,
    subject: "OTP for sign in!",
    html: maildata,
  };
  const isSuccess = await transporter.sendMail(mailOptionsInfo);
  const emailLogData = {
    emailType,
    emailFrom: mailOptions.from,
    emailTo: userData.email,
    subject: emailConstants.signInOtpsubject,
    body: maildata,
    status: isSuccess.accepted.length !== 0 ? "SUCCESS" : "FAIL",
  };
  return await saveEmailLogs(emailLogData);
};
/**FUNC- TO SEND EMAIL TO USER */
const sendEmail = async (email, emailType, emailSubject, mailData,attachedFileDetails=[]) => {
  console.log("email sendddddddddddddddddddddddd====================",email)
  const mailOptionsInfo = {
    from: mailOptions.from,
    to: email,
    subject: emailSubject,
    html: mailData,
    attachments:attachedFileDetails 
  };
  const isSuccess = await transporter.sendMail(mailOptionsInfo);
  const emailLogData = {
    emailType,
    emailFrom: mailOptions.from,
    emailTo: email,
    subject: emailSubject,
    body: mailData,
    status: isSuccess.accepted.length !== 0 ? "SUCCESS" : "FAIL",
  };
  return await saveEmailLogs(emailLogData);
};
/**FUNC- TO SAVE EMAIL LOGS */
const saveEmailLogs = async (emailData) => {
  const emailLogData = new EmailLogs(emailData);
  return await emailLogData.save();
};
module.exports = {
  sendSignInOtpEmail,
  saveEmailLogs,
  sendEmail,
};
