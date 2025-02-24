const EmailTemplate = require("../models/emailTemplateModel");
const commonHelper = require("../helpers/commonHelper");

const addComma = (array, index) => {
  if (array.length > 1 && array.length !== index + 1) {
    return " s ";
  } else {
    return " ";
  }
};
const signInByOtpEmail = async (userData, otp) =>
  new Promise((resolve, reject) => {
    const myvar =
      `${"<!DOCTYPE html>" +
      '<html lang="en">' +
      "  <head>" +
      '    <meta charset="utf-8" />' +
      "    <title>MOM Management </title>" +
      "    <link" +
      '      rel="stylesheet"' +
      '      href="https://use.fontawesome.com/releases/v5.7.2/css/all.css"/>' +
      '    <style type="text/css">' +
      "      body {" +
      "        font-family: Arial, sans-serif !important;" +
      "        color: #222222;" +
      "      }" +
      "    </style>" +
      "  </head>" +
      "<body>" +
      '<p style="font-size: 30px; color: #464646;margin-bottom: 0;">' +
      "              Welcome <b>"
      }${userData.name} </b> your otp is ${otp}` +
      "            </p>" +
      "  </body>" +
      "</html>";
    resolve(myvar);
  });

const sampleTest = async (attendeeName) =>
  new Promise((resolve, reject) => {
    const myvar =
      `${"<!DOCTYPE html>" +
      '<html lang="en">' +
      "  <head>" +
      '    <meta charset="utf-8" />' +
      "    <title>MOM Management </title>" +
      "    <link" +
      '      rel="stylesheet"' +
      '      href="https://use.fontawesome.com/releases/v5.7.2/css/all.css"/>' +
      '    <style type="text/css">' +
      "      body {" +
      "        font-family: Arial, sans-serif !important;" +
      "        color: #222222;" +
      "      }" +
      "    </style>" +
      "  </head>" +
      "<body>" +
      '<p style="font-size: 30px; color: #464646;margin-bottom: 0;">' +
      "              Welcome <b>"
      }${attendeeName}` +
      "            </p>" +
      "  </body>" +
      "</html>";
    resolve(myvar);
  });

const updateMeeting = async (action) =>
  new Promise((resolve, reject) => {
    const myvar =
      `${"<!DOCTYPE html>" +
      '<html lang="en">' +
      "  <head>" +
      '    <meta charset="utf-8" />' +
      "    <title>MOM Management </title>" +
      "    <link" +
      '      rel="stylesheet"' +
      '      href="https://use.fontawesome.com/releases/v5.7.2/css/all.css"/>' +
      '    <style type="text/css">' +
      "      body {" +
      "        font-family: Arial, sans-serif !important;" +
      "        color: #222222;" +
      "      }" +
      "    </style>" +
      "  </head>" +
      "<body>" +
      '<p style="font-size: 30px; color: #464646;margin-bottom: 0;">' +
      "             Meeting is <b>"
      }${action} </b>` +
      "            </p>" +
      "  </body>" +
      "</html>";
    resolve(myvar);
  });

const sendCancelMeetingEmailTemplate = async (meetingData, attendeeName, logo) => {
  try {
    const template = await EmailTemplate.findOne({ templateType: 'MEETINGCANCEL', isActive: true });
    console.log("Template====", template);

    if (!template) {
      throw new Error(`No active template found for type: MEETINGCANCEL`);
    }

  //  let salutation = '';
    let body = '';
    let subject = '';

    if (template.meetingCancelCredentials) {
    //  salutation = template.dear || '';
      body = template.meetingCancelCredentials.body || '';
      subject = template.subject || '';
    } else {
      throw new Error(`No credentials found for template type: MEETINGCANCEL`);
    }


  //  salutation = salutation.replace('{attendeeName}', attendeeName);
    
    body = body
      .replace('{attendeeName}', attendeeName)
      .replace('{meetingTitle}', commonHelper.decryptWithAES(meetingData.title))
      .replace('{meetingId}', meetingData.meetingId)
      .replace('{meetingLink}', `${process.env.FRONTEND_URL}/view-meeting-details/${meetingData._id}`)
      .replace('{meetingDate}', new Date(meetingData.date).toDateString())
      .replace('{fromTime}', meetingData.fromTime)
      .replace('{toTime}', meetingData.toTime)
      .replace('{cancellationReason}', meetingData.meetingStatus.remarks)
      .replace('{createdByName}', meetingData.createdByDetail.name)
      .replace('{createdByEmail}', meetingData.createdByDetail.email);

    subject = subject
      .replace('{meetingTitle}', commonHelper.decryptWithAES(meetingData.title))
      .replace('{meetingDate}', new Date(meetingData.date).toDateString())
      .replace('{fromTime}', meetingData.fromTime)
      .replace('{toTime}', meetingData.toTime)

    const mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>" +
      "</div>" +
      "</div>";

    console.log("Mail subject generated:", subject);
    console.log("Mail body generated:", mailBody);

    return { subject, mailBody };
  } catch (error) {
    console.error("Error generating cancel meeting email:", error);
    throw error;
  }
};


const sendScheduledMeetingEmailTemplate = async (
  meetingData,
  attendeeName,
  logo,
  agendaData,
  attendeeData,
  attendee,
  hostingPassword,
  meetingLink,
  hostKey
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "SENDSCHEDULEMEETING",
      isActive: true,
    });

    if (!template) {
      throw new Error("No active template found for type: SENDSCHEDULEMEETING");
    }

   // let salutation = "";
    let body = "";
    let subject = "";

    if (template.sendScheduledMeetingCredentials) {
    //  salutation = template.dear;
      body = template.sendScheduledMeetingCredentials.body;
      subject = template.subject;
    } else {
      throw new Error("No body found for template type: SENDSCHEDULEMEETING");
    }

    //  const meetingLinkUrl = meetingLink || meetingData?.link || "Not Available";

    let link = null;
    if (meetingLink) {
      link = meetingLink;
    } else if (meetingData?.link) {
      link = meetingData.link;
    }

    // salutation = salutation.replace(
    //   "{name}",
    //   commonHelper.convertFirstLetterOfFullNameToCapital(attendeeName)
    // );

    body = body
      .replace("{meetingdetailLink}",`${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}`)
      .replace("{userManualLink}", process.env.USER_MANUAL_LINK)
      .replace("{meetingMode}",commonHelper.convertFirstLetterToCapital(meetingData.mode))
      .replace("{meetingId}", meetingData?.meetingId)
      .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData.title))
      .replace("{meetingLink}", link)
      .replace(
        "{meetingLocation}",
        meetingData.locationDetails?.isMeetingRoom === true
          ? meetingData?.roomDetail[0]?.title +
          " , " +
          meetingData?.roomDetail[0]?.location
          : meetingData?.locationDetails?.location
      )
      .replace("{meetingDate}", new Date(meetingData.date).toDateString())
      .replace("{fromTime}", meetingData.fromTime)
      .replace("{toTime}", meetingData.toTime)
      .replace("{attendees}", attendeeData)
      .replace("{agenda}", agendaData)
      .replace(
        "{yes}",
        `<a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/YES/${attendee?._id}><button>Yes</button></a>`
      )
      .replace(
        "{no}",
        `<a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/NO/${attendee?._id}><button>No</button></a>`
      )
      .replace(
        "{mayBe}",
        `<a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/MAYBE/${attendee?._id}><button>May Be</button></a>`
      )
      .replace("{organizerName}", meetingData.createdByDetail.name)
      .replace("{organizerEmail}", meetingData.createdByDetail.email);

    subject = subject
      .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData.title))
      .replace("{meetingDate}", new Date(meetingData.date).toDateString())
      .replace("{fromTime}", meetingData.fromTime)
      .replace("{toTime}", meetingData.toTime)
      .replace("{organizerEmail}", meetingData.createdByDetail.email);

    const mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin:0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      `</a>` +
      `<div style="padding: 20px; font-family: Arial, sans-serif; color: #000;">` +
    // `${salutation}` +
      `${body}` +
      `</div>` +
      `</div>` +
      `</div>` +
      `</div>`;

    console.log("Mail subject generated:", subject);
    console.log("Mail body generated:", mailBody);

    return { emailSubject: subject, mailData: mailBody };
  } catch (error) {
    console.error("Error generating email template:", error.message);
    throw error;
  }
};



const sendReScheduledMeetingEmailTemplate = async (
  meetingData,
  attendeeName,
  logo,
  agendaData,
  attendeeData,
  attendee,
  hostingPassword,
  meetingLink,
  hostKey
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "RESCHEDULE",
      isActive: true,
    });

    if (!template) {
      throw new Error("No active template found for type: RESCHEDULE");
    }

  //  let salutation = "";
    let body = "";
    let subject = "";

    if (template.rescheduleCredentials) {
    //  salutation = template.dear;
      body = template.rescheduleCredentials.body;
      subject = template.subject;
    } else {
      throw new Error("No body found for template type: RESCHEDULE");
    }

    const meetingLinkUrl = meetingLink || meetingData?.link || "Not Available";
    const location = meetingData.locationDetails?.isMeetingRoom
      ? `${meetingData.roomDetail[0]?.title}, ${meetingData.roomDetail[0]?.location}`
      : meetingData.locationDetails?.location;

    const attendeeList = attendeeData;
    // const agendaList = agendaData;

    // salutation = salutation.replace(
    //   "{name}",
    //   commonHelper.convertFirstLetterOfFullNameToCapital(attendeeName)
    // );

    body = body
      .replace(
        "{name}",
        commonHelper.convertFirstLetterOfFullNameToCapital(attendeeName)
      )
      .replace(/{meetingTitle}/g, commonHelper.decryptWithAES(meetingData.title))
      .replace(/{meetingId}/g, meetingData.meetingId)
      .replace(/{meetingDate}/g, new Date(meetingData.date).toDateString())
      .replace(/{fromTime}/g, meetingData.fromTime)
      .replace(/{toTime}/g, meetingData.toTime)
      .replace(/{rescheduleReason}/g, meetingData?.meetingStatus?.remarks)
      .replace(/{meetingMode}/g, meetingData.mode)
      //.replace(/{meetingLink}/g, meetingLinkUrl)
      .replace(
        /{meetingLink}/g,
        `<a href="${meetingLinkUrl}">
           Click to Join Meeting
         </a>`
      )
      .replace(/{hostingPassword}/g, hostingPassword || "null")
      .replace(/{hostKey}/g, hostKey || "null")
      .replace(/{meetingLocation}/g, location)
      .replace(/{attendees}/g, attendeeList)
      .replace(/{agendaData}/g, agendaData)
      .replace(
        /{link}/g,
        `${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}`
      )
      .replace(
        /{replyLinkYes}/g,
        `<a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/YES/${attendee?._id}><button>Yes</button></a>`
      )
      .replace(
        /{replyLinkNo}/g,
        `<a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/NO/${attendee?._id}><button>No</button></a>`
      )
      .replace(
        /{replyLinkMaybe}/g,
        `<a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/MAYBE/${attendee?._id}><button>May Be</button></a>`
      )
      // .replace(
      //   /{replyLinkYes}/g,
      //   `<a href="${process.env.FRONTEND_URL}/login/${meetingData?._id}/YES/${attendee?._id}">
      //      <button>Yes</button>
      //    </a>`
      // )
      // .replace(
      //   /{replyLinkNo}/g,
      //   `<a href="${process.env.FRONTEND_URL}/login/${meetingData?._id}/NO/${attendee?._id}">
      //      <button>No</button>
      //    </a>`
      // )
      // .replace(
      //   /{replyLinkMaybe}/g,
      //   `<a href="${process.env.FRONTEND_URL}/login/${meetingData?._id}/MAYBE/${attendee?._id}">
      //      <button>Maybe</button>
      //    </a>`
      // )
      .replace(/{createdByName}/g, meetingData.createdByDetail?.name)
      .replace(/{createdByEmail}/g, meetingData.createdByDetail?.email);

    subject = subject
      .replace(/{meetingTitle}/g, commonHelper.decryptWithAES(meetingData.title))
      .replace(/{meetingDate}/g, new Date(meetingData.date).toDateString())
      .replace("{fromTime}", meetingData.fromTime)
      .replace("{toTime}", meetingData.toTime);

    const mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin:0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      `</a>` +
      `<div style="padding: 20px; font-family: Arial, sans-serif; color: #000;">` +
      // `${salutation}` +
      `${body}` +
      `</div>` +
      `</div>` +
      `</div>` +
      `</div>`;

    // return emailContent;
    console.log("Mail subject generated:", subject);
    console.log("Mail body generated:", mailBody);

    return { emailSubject: subject, mailData: mailBody };
  } catch (error) {
    console.error("Error generating email template:", error.message);
    throw error;
  }
};



const sendCreateMinutesEmailTemplate = async (
  meetingData,
  attendeeName,
  logo
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "GENERATEMOM",
      isActive: true,
    });

    if (!template) {
      throw new Error("No active template found for type: GENERATEMOM");
    }

  //  let salutation = "";
    let body = "";
    let subject = "";

    if (template.generateMomCredentials) {
    //  salutation = template.dear;
      body = template.generateMomCredentials.body;
      subject = template.subject;
    } else {
      throw new Error("No body found for template type: GENERATEMOM");
    }

    const attendeeData = meetingData?.attendees
      .map((attendee) => `${attendee.name} (${attendee.email})`)
      .join(", ");

    const meetingLink = meetingData?.link || "Not Available";

    // salutation = salutation.replace(
    //   "{name}",
    //   commonHelper.convertFirstLetterOfFullNameToCapital(attendeeName)
    // );
    body = body
      .replace(
        "{name}",
        commonHelper.convertFirstLetterOfFullNameToCapital(attendeeName)
      )
      .replace(/{meetingTitle}/g, commonHelper.decryptWithAES(meetingData.title))
      .replace(/{meetingId}/g, meetingData.meetingId)
      .replace(/{meetingDate}/g, new Date(meetingData.date).toDateString())
      .replace(/{fromTime}/g, meetingData.fromTime)
      .replace(/{toTime}/g, meetingData.toTime)
      .replace(/{meetingMode}/g, meetingData.mode)
      .replace(
        /{meetingLocation}/g,
        meetingData.locationDetails?.isMeetingRoom
          ? `${meetingData.roomDetail[0]?.title}, ${meetingData.roomDetail[0]?.location}`
          : meetingData.locationDetails?.location
      )
      .replace(/{meetingLink}/g, meetingLink)
      .replace(/{attendees}/g, attendeeData)
      .replace(
        /{createdByName}/g,
        commonHelper.convertFirstLetterOfFullNameToCapital(
          meetingData.createdByDetail?.name
        )
      )
      .replace(/{createdByEmail}/g, meetingData.createdByDetail?.email)
      .replace(
        /{link}/g,
        `${process.env.FRONTEND_URL}/view-minute-detail/${meetingData?._id}`
      );

    subject = subject
      .replace(/{meetingTitle}/g, commonHelper.decryptWithAES(meetingData.title))
      .replace(/{meetingDate}/g, new Date(meetingData.date).toDateString())
      .replace(
        /{meetingTime}/g,
        `${meetingData.fromTime} to ${meetingData.toTime}`
      );

    const mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin:0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      `</a>` +
      `<div style="padding: 20px; font-family: Arial, sans-serif; color: #000;">` +
      // `${salutation}` +
      `${body}` +
      `</div>` +
      `</div>` +
      `</div>` +
      `</div>`;

    console.log("Mail subject generated:", subject);
    console.log("Mail body generated:", mailBody);

    return { emailSubject: subject, mailData: mailBody };
  } catch (error) {
    console.error("Error generating Create Minutes email template:", error);
    throw error;
  }
};

const actionReassignEmailToOlAssignedUserTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  reason,
  action,
  userData,
  oldAssignedUserDetails,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({ templateType: 'ACTIONREASSIGNTOOLDUSER', isActive: true });

      if (!template) {
        return reject(new Error(`No active template found for type: ACTIONREASSIGNTOOLDUSER`));
      }

      let oldmailBody = '';
      let body = '';
      let subject = '';

      if (template.actionAssignToOldAssignedUserCredentials) {
        body = template.actionAssignToOldAssignedUserCredentials.body || '';
        subject = template.subject || '';
      } else {
        return reject(new Error(`No body found for template type: ACTIONREASSIGNTOOLDUSER`));
      }

      subject = subject.replace(/{meetingTitle}/g, commonHelper.decryptWithAES(meetingData.title))
        .replace(/{organizerEmail}/g, meetingData?.createdByDetail?.email)

      body = body
      .replace('{oldAssignedUserName}', oldAssignedUserDetails?.name)
        .replace(/{actionDescription}/g, commonHelper.decryptWithAES(action?.description))
        .replace(/{reason}/g, reason)
        .replace(/{assignedUserName}/g, assignedUserDetails?.name)
        .replace(/{assignedUserEmail}/g, assignedUserDetails?.email)
        .replace(/{organizerName}/g, userData.name)
        .replace(/{organizerEmail}/g, userData.email)

      oldmailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>";
      "</div>";
      "</div>";

      resolve({
        oldemailSubject: subject,
        mailOldData: oldmailBody,
      });
    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
}


const actionReassignEmailTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  reason,
  userData,
  action
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({
        templateType: "ACTIONFORWARDED",
        isActive: true,
      });

      if (!template) {
        return reject(
          new Error(`No active template found for type: ACTIONFORWARDED`)
        );
      }

      let mailBody = "";
      let body = "";
      let subject = "";

      if (template.actionForwardedCredentials) {
        body = template.actionForwardedCredentials.body || "";
        subject = template.subject;
      } else {
        return reject(
          new Error(`No body found for template type: ACTIONFORWARDED`)
        );
      }
      body = body
        .replace(
          "{actionlink}",
          `${process.env.FRONTEND_URL}/view-action-detail/${action._id}`
        )
        .replace("{reason}", reason)
        .replace(/{actionTitle}/g, commonHelper.decryptWithAES(action.title))
        .replace(
          /{name}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            assignedUserDetails?.name
          )
        )
        .replace(
          /{organizerName}/g,
          userData.name
        )
        .replace(/{organizerEmail}/g, userData.email);
      subject = subject.replace(/{actionTitle}/g, commonHelper.decryptWithAES(action.title));

      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}"  alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>";
      ("</div>");
      ("</div>");

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });
    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
};

const actionAssignEmailTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  action,
  userData
) => {
  console.log("meetingData Template", meetingData)
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({
        templateType: "ACTIONASSIGN",
        isActive: true,
      });

      if (!template) {
        return reject(
          new Error(`No active template found for type: ACTIONASSIGN`)
        );
      }

      let mailBody = "";
      let body = "";
      let subject = "";

      if (template.actionAssignCredentials) {
        body = template.actionAssignCredentials.body || "";
        subject = template.subject;
      } else {
        return reject(
          new Error(`No body found for template type: ACTIONASSIGN`)
        );
      }

      body = body
        .replace(
          "{actionlink}",
          `${process.env.FRONTEND_URL}/view-action-detail/${action._id}`
        )
        .replace(
          "{organizerName}", userData.name)
        .replace(
          /{name}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            assignedUserDetails?.name
          )
        )
        .replace("{organizerEmail}", userData.email);
      subject = subject.replace("{actionTitle}", commonHelper.decryptWithAES(action.title));

      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>";
      ("</div>");
      ("</div>");

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });
    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
};

const actionReOpenEmailTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  reason,
  action
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({
        templateType: "ACTIONREOPEN",
        isActive: true,
      });

      if (!template) {
        return reject(
          new Error(`No active template found for type: ACTIONREOPEN`)
        );
      }

      let mailBody = "";
     // let salutation = "";
      let body = "";
      let subject = "";

      if (template.actionReOpenCredentials) {
        body = template.actionReOpenCredentials.body || "";
      //  salutation = template.dear || "";
        subject = template.subject;
      } else {
        return reject(
          new Error(`No body found for template type: ACTIONREOPEN`)
        );
      }

      // salutation = salutation.replace(
      //   "{name}",
      //   commonHelper.convertFirstLetterOfFullNameToCapital(
      //     assignedUserDetails?.name
      //   )
      // );
      body = body
        .replace(
          /{actionlink}/g,
          `${process.env.FRONTEND_URL}/view-action-detail/${action._id}`
        )
        .replace(/{reason}/g, reason)
        .replace(
          /{name}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            assignedUserDetails?.name
          )
        )
        .replace(/{meetingId}/g, meetingData?.meetingId)
        .replace(/{meetingTitle}/g, commonHelper.decryptWithAES(meetingData?.title))
        .replace(/{description}/g, commonHelper.decryptWithAES(action?.description))
        .replace(/{actionTitle}/g, commonHelper.decryptWithAES(action.title))
        .replace(
          /{organizerName}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            meetingData.createdByDetail.name
          )
        )
        .replace(/{organizerEmail}/g, meetingData.createdByDetail.email);
      subject = subject.replace("{actionTitle}", commonHelper.decryptWithAES(action.title));
      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>";
      ("</div>");
      ("</div>");

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });
    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
};

const sendAmendmentCreatedEmailTemplate = async (
  meetingData,
  attendeeDetails,
  logo,
  action
) =>
  new Promise((resolve, reject) => {
    const myVar =
      `${'<div style="background-color: #e9f3ff;margin:0;padding:0; width:100%;">' +
      '<div style="background-color: #e9f3ff; width:100%;padding-bottom:60px">' +
      '<table style="margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;width:100%;max-width:640px" align="center" cellpadding="0" cellspacing="0" border="0">' +
      "<tbody>" +
      "<tr>" +
      '<td valign="middle" align="center" height="60" style="border-collapse:collapse"></td>' +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      '<table cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;margin:0 auto">' +
      "<tbody>" +
      "<tr>" +
      "<td>" +
      '<table cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF">' +
      "<tbody>" +
      "<tr>" +
      "<td>" +
      '<table border="0" style="margin:0 auto" cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF" valign="center" align="center">' +
      "<tbody>" +
      "<tr>" +
      '<td style="padding: 30px 0px 30px;color:#545d5e;font-family:Helvetica;font-size:12px;line-height:180%;vertical-align:top;text-align:center">' +
      "<span>" +
      `<a href=${process.env.TARGET_WEBSITE} style="widht: 100%; text-align: center;">` +
      `<img style="float: none; margin: 0 auto; display: block;" src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      '<p style="color: #000 !important">Dear'
      } ${meetingData?.createdByDetail?.name},</p>` +
      '<p style="color: #000 !important">I hope this email finds you well.</p>' +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">We would like to inform you that we have received an amendment request from the below attendee. Please visit the link below to view the request details.

        </p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;">Attendee:</p>' +
      `<p style="color: #000 !important; margin:0px;">${attendeeDetails.name}</p>` +
      `<p style="color: #000 !important; margin:0px;">${attendeeDetails.email}</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${meetingData.createdByDetail.name}` +
      `<br />${meetingData.createdByDetail.email} <br />` +
      "</strong></p>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<table width="100%" style="margin: 0 auto;" cellpadding="0" cellspacing="0" border="0">' +
      "<tbody>" +
      "<tr>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</div>" +
      "</div>";
    resolve(myVar);
  });

const acceptMinuteEmailTemplate = async (meetingData, attendeeDetails, logo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({ templateType: 'ACCEPTMINUTES', isActive: true });

      if (!template) {
        return reject(new Error(`No active template found for type: ACCEPTMINUTES`));
      }

      let mailBody = '';
      let body = '';
      let subject = '';

      if (template.acceptMinutesCredentials) {
        body = template.acceptMinutesCredentials.body || '';
        subject = template.subject || '';
      } else {
        return reject(new Error(`No body found for template type: ACCEPTMINUTES`));
      }

      subject = subject.replace(/{meetingTitle}/g, commonHelper.decryptWithAES(meetingData.title))
        .replace(/{organizerEmail}/g, meetingData?.createdByDetail?.email)
        .replace(/{attendeeName}/g, attendeeDetails.name)
        .replace(/{attendeeEmail}/g, attendeeDetails.email)
      body = body.replace('{minuteDetailLink}', `${process.env.FRONTEND_URL}/view-minute-detail/${meetingData?._id}`)
        .replace(/{attendeeName}/g, attendeeDetails.name)
        .replace(/{attendeeEmail}/g, attendeeDetails.email)
        .replace(/{organizerName}/g, meetingData.createdByDetail.name)
        .replace(/{organizerEmail}/g, meetingData.createdByDetail.email)

      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>";
      "</div>";
      "</div>";

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });

    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
}


const meetingRemindersEmailTemplate = async (
  meetingData,
  createdByDetail,
  logo,
  empDetails,
  agendaData,
  attendeeData,
  meetingLink
) =>
  new Promise((resolve, reject) => {
    let link = null;
    console.log(
      "meetingData?.hostDetails==================",
      meetingData?.hostDetails
    );
    // if (meetingData?.hostDetails?.hostLink) {
    //   link = meetingData?.hostDetails?.hostLink;
    // } else {
    //   if (meetingData?.link) {
    //     link = meetingData?.link;
    //   }
    // }

    if (meetingLink) {
      link = meetingLink;
    }
    console.log("meetingLink-----------------------", meetingLink, link);
    console.log("link-----------------------", link);
    const myVar =
      `${'<div style="background-color: #e9f3ff;margin:0;padding:0; width:100%;">' +
      '<div style="background-color: #e9f3ff; width:100%;padding-bottom:60px">' +
      '<table style="margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;width:100%;max-width:640px" align="center" cellpadding="0" cellspacing="0" border="0">' +
      "<tbody>" +
      "<tr>" +
      '<td valign="middle" align="center" height="60" style="border-collapse:collapse"></td>' +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      '<table cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;margin:0 auto">' +
      "<tbody>" +
      "<tr>" +
      "<td>" +
      '<table cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF">' +
      "<tbody>" +
      "<tr>" +
      "<td>" +
      '<table border="0" style="margin:0 auto" cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF" valign="center" align="center">' +
      "<tbody>" +
      "<tr>" +
      '<td style="padding: 30px 0px 30px;color:#545d5e;font-family:Helvetica;font-size:12px;line-height:180%;vertical-align:top;text-align:center">' +
      "<span>" +
      `<a href=${process.env.TARGET_WEBSITE} style="widht: 100%; text-align: center;">` +
      `<img style="float: none; margin: 0 auto; display: block;" src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      '<p style="color: #000 !important">Dear'
      } ${empDetails?.name},</p>` +
      '<p style="color: #000 !important">You have an upcoming meeting scheduled.</p>' +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">Below are the details:</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Link</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Id</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData?.meetingId}</p>` +
      `<p style="color: #000 !important;margin-bottom:0px;"><strong>When${meetingData?.meetingStatus?.status == "rescheduled"
        ? "(Rescheduled)"
        : "<span style='display:none'>(Rescheduled)</span>"
      }</strong></p>` +
      `<p style="color: #000 !important; margin:0px;">${new Date(
        meetingData.date
      ).toDateString()}, ${meetingData.fromTime}
  -  ${meetingData.toTime}</p>` +
      `${meetingData?.meetingStatus?.status == "rescheduled"
        ? '<p style="color: #000 !important;margin-bottom:0px;"><strong>Reason of Reschedule</strong></p>'
        : "<span style='display:none'>(Rescheduled)</span>"
      }` +
      `${meetingData?.meetingStatus?.status == "rescheduled"
        ? `<p style="color: #000 !important; margin:0px;">${meetingData?.meetingStatus?.remarks}</p>`
        : "<span style='display:none'>(Rescheduled)</span>"
      }` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Mode</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${meetingData?.mode}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Link</strong></p>' +
      `${link == undefined || link == null || link == ""
        ? '<p style="color: #000 !important;margin:0px;">Not Available</p>'
        : `<a style="margin:0px;" href="${link}">Click to join metting</a>`
      }` +
      `${meetingData?.hostDetails?.hostingPassword !== undefined || null || ""
        ? '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Link Password</strong></p>' +
        `<p style="color: #000 !important;margin:0px;">${meetingData?.hostDetails?.hostingPassword}</p>`
        : `<p style="color: #000 !important;margin:0px;display:none;">NA</p>`
      }` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Location</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData.locationDetails?.isMeetingRoom === true
        ? meetingData?.roomDetail[0]?.title +
        " , " +
        meetingData?.roomDetail[0]?.location
        : meetingData?.locationDetails?.location
      }</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Guests</strong></p>' +
      `<p style="color: #000 !important;margin:0px">${attendeeData}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Agenda(s)</strong></p>' +
      `${agendaData}` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      // `<p style="color: #000 !important">${process.env.FRONTEND_URL}</p>` +

      // `<p style="color: #000 !important; margin:0px;">${attendeeDetails.name}</p>` +
      // `<p style="color: #000 !important; margin:0px;">${attendeeDetails.email}</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${meetingData.createdByDetail.name}` +
      `<br />${meetingData.createdByDetail.email} <br />` +
      "</strong></p>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<table width="100%" style="margin: 0 auto;" cellpadding="0" cellspacing="0" border="0">' +
      "<tbody>" +
      "<tr>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</div>" +
      "</div>";
    resolve(myVar);
  });

const actionReassignRequestRejectEmailTemplate = async (
  meetingData,
  logo,
  attendeeDetails,
  remark,
  actionDetails
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "ACTIONREASSIGNREQUESTREJECT",
      isActive: true,
    });
    console.log("Template====", template);

    if (!template) {
      throw new Error(
        "No active template found for type: ACTIONREASSIGNREQUESTREJECT"
      );
    }

    let mailBody = "";
  //  let salutation = "";
    let body = "";
    let subject = "";

    if (template.actionReassignRequestRejectCredentials) {
      body = template.actionReassignRequestRejectCredentials.body;
    //  salutation = template.dear;
      subject = template.subject;
    } else {
      throw new Error(
        "No body found for template type: ACTIONREASSIGNREQUESTREJECT"
      );
    }

    console.log("Attendee Details:", attendeeDetails);
    console.log("Template Body Before Replace:", body);

  //  salutation = salutation.replace("{assignedUserName}", commonHelper.convertFirstLetterOfFullNameToCapital(attendeeDetails.name));
    body = body
      .replace("{assignedUserName}", commonHelper.convertFirstLetterOfFullNameToCapital(attendeeDetails.name))
      .replace( "{actionlink}", `${process.env.FRONTEND_URL}/view-action-detail/${actionDetails?._id}`)
      .replace("{rejectReason}", remark)

      .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData.title))
      .replace("{meetingId}", meetingData.meetingId)
      .replace("{description}", commonHelper.decryptWithAES(actionDetails?.description))
      .replace("{organizerName}", meetingData?.createdByDetail?.name)
      .replace("{organizerEmail}", meetingData?.createdByDetail?.email)
    //  .replace("{assignedUserName}", attendeeDetails.name)
      .replace("{assignedUserEmail}", attendeeDetails.email);

    //  subject = subject.replace('{organizerName}', meetingData?.createdByDetail?.name);
    subject = subject.replace("{actionTitle}", commonHelper.decryptWithAES(actionDetails.title));

    console.log("Final Body After Replace:", body);

    mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>";
    ("</div>");
    ("</div>");
    // console.log("Mail subject --------:", subject);
    console.log("Mail body --------:", mailBody);

    return { emailSubject: subject, mailData: mailBody };
  } catch (error) {
    console.error(
      "Error generating Action Reassign Request reject email template:",
      error
    );
    throw error;
  }
};

const createNewEmployeeEmailTemplate = async (adminDetails, logo, empData) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "ADDEMPLOYEE",
      isActive: true,
    });
    console.log("Template====", template);

    if (!template) {
      throw new Error("No active template found for type: ADDEMPLOYEE");
    }

    let mailBody = "";
  //  let salutation = "";
    let body = "";
    let subject = "";

    if (template.addEmployeeCredentials) {
      body = template.addEmployeeCredentials.body;
    //  salutation = template.dear;
      subject = template.subject;
    } else {
      throw new Error("No body found for template type: ADDEMPLOYEE");
    }

    console.log("Template Body Before Replace:", body);

  //  salutation = salutation.replace("{employeeName}",commonHelper.convertFirstLetterOfFullNameToCapital(empData.name));

    body = body
    .replace("{employeeName}",commonHelper.convertFirstLetterOfFullNameToCapital(empData.name))
      .replace("{frontendUrlLink}", `${process.env.FRONTEND_URL}`)
      .replace("{userManualLink}", `${process.env.USER_MANUAL_LINK}`)
      .replace("{employeeEmail}", empData.email)
      .replace("{adminName}", adminDetails.name)
      .replace("{adminEmail}", adminDetails.email);

    subject = subject.replace(
      "{organizationName}",
      adminDetails?.organizationDetail?.name
    );

    console.log("Final Body After Replace:", body);

    mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>";
    ("</div>");
    ("</div>");
    // console.log("Mail subject --------:", subject);
    console.log("Mail body --------:", mailBody);

    return { emailSubject: subject, mailData: mailBody };
  } catch (error) {
    console.error("Error generating Add Employee email template:", error);
    throw error;
  }
};

const sendGiveWriteMOMPermissionEmailTemplate = async (meetingData, attendeeName, logo) => {
  try {
    const template = await EmailTemplate.findOne({ templateType: 'GIVEWRITMOMPERMISSION', isActive: true });
    console.log("Template====", template);

    if (!template) {
      throw new Error(`No active template found for type: GIVEWRITMOMPERMISSION`);
    }

  //  let salutation = '';
    let body = '';
    let subject = '';

    if (template.giveWritemomPermissionCredentials) {
    //  salutation = template.dear || '';
      body = template.giveWritemomPermissionCredentials.body || '';
      subject = template.subject || '';
    } else {
      throw new Error(`No credentials found for template type: GIVEWRITMOMPERMISSION`);
    }

   // salutation = salutation.replace('{attendeeName}', attendeeName);
    
    body = body
    .replace('{attendeeName}', attendeeName)
      .replace('{meetingTitle}', commonHelper.decryptWithAES(meetingData.title))
      .replace('{meetingId}', meetingData.meetingId)
      .replace('{meetingLink}', `${process.env.FRONTEND_URL}/view-meeting-details/${meetingData._id}`)
      .replace('{createdByName}', meetingData.createdByDetail.name)
      .replace('{createdByEmail}', meetingData.createdByDetail.email);

    subject = subject.replace('{meetingTitle}', commonHelper.decryptWithAES(meetingData.title));

    const mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>" +
      "</div>" +
      "</div>";
    console.log("Mail subject generated:", subject);
    console.log("Mail body generated:", mailBody);

    return { subject, mailBody };
  } catch (error) {
    console.error("Error generating MOM permission email:", error);
    throw error;
  }
};


const actionReassignForOlAssigneeEmailTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  reason,
  action
) =>
  new Promise((resolve, reject) => {
    const myVar =
      `${'<div style="background-color: #e9f3ff;margin:0;padding:0; width:100%;">' +
      '<div style="background-color: #e9f3ff; width:100%;padding-bottom:60px">' +
      '<table style="margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;width:100%;max-width:640px" align="center" cellpadding="0" cellspacing="0" border="0">' +
      "<tbody>" +
      "<tr>" +
      '<td valign="middle" align="center" height="60" style="border-collapse:collapse"></td>' +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      '<table cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;margin:0 auto">' +
      "<tbody>" +
      "<tr>" +
      "<td>" +
      '<table cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF">' +
      "<tbody>" +
      "<tr>" +
      "<td>" +
      '<table border="0" style="margin:0 auto" cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF" valign="center" align="center">' +
      "<tbody>" +
      "<tr>" +
      '<td style="padding: 30px 0px 30px;color:#545d5e;font-family:Helvetica;font-size:12px;line-height:180%;vertical-align:top;text-align:center">' +
      "<span>" +
      `<a href=${process.env.TARGET_WEBSITE} style="widht: 100%; text-align: center;">` +
      `<img style="float: none; margin: 0 auto; display: block;" src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      '<p style="color: #000 !important">Dear'
      } ${commonHelper.convertFirstLetterOfFullNameToCapital(
        assignedUserDetails?.name
      )},</p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">An action has been forward to you. Please visit the link below to view the meeting and action details.
  </p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-action-detail/${action._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Reason for Forward:</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${reason}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" >Please make sure to complete the assigned tasks by the specified due dates. If you encounter any challenges or require assistance, please do not hesitate to reach out to me or the relevant team members.</p>' +
      '<p style="color: #000 !important;margin-bottom:0px;" >Your prompt attention to these action items is greatly appreciated.</p>' +
      `<p style="color: #000 !important;margin:0px;">Thank you for your cooperation.</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${meetingData.createdByDetail.name}` +
      `<br />${meetingData.createdByDetail.email} <br />` +
      "</strong></p>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<table width="100%" style="margin: 0 auto;" cellpadding="0" cellspacing="0" border="0">' +
      "<tbody>" +
      "<tr>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</div>" +
      "</div>";
    resolve(myVar);
  });

const sendActionDueReminderEmailTemplate = async (
  meetingData,
  actionDetails,
  attendeeDetails,
  logo
) =>
  new Promise((resolve, reject) => {
    const myVar =
      `${'<div style="background-color: #e9f3ff;margin:0;padding:0; width:100%;">' +
      '<div style="background-color: #e9f3ff; width:100%;padding-bottom:60px">' +
      '<table style="margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;width:100%;max-width:640px" align="center" cellpadding="0" cellspacing="0" border="0">' +
      "<tbody>" +
      "<tr>" +
      '<td valign="middle" align="center" height="60" style="border-collapse:collapse"></td>' +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      '<table cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;margin:0 auto">' +
      "<tbody>" +
      "<tr>" +
      "<td>" +
      '<table cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF">' +
      "<tbody>" +
      "<tr>" +
      "<td>" +
      '<table border="0" style="margin:0 auto" cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF" valign="center" align="center">' +
      "<tbody>" +
      "<tr>" +
      '<td style="padding: 30px 0px 30px;color:#545d5e;font-family:Helvetica;font-size:12px;line-height:180%;vertical-align:top;text-align:center">' +
      "<span>" +
      `<a href=${process.env.TARGET_WEBSITE} style="widht: 100%; text-align: center;">` +
      `<img style="float: none; margin: 0 auto; display: block;" src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      '<p style="color: #000 !important">Dear Attendee'
      } </p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">The below assigned action is due. Please find the action details below.</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Action</strong></p>' +
      `<p style="color: #000 !important; margin:0px">${commonHelper.decryptWithAES(actionDetails?.description)}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;">Action Link</p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-action-detail/${actionDetails?._id}</p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      // `<p style="color: #000 !important">${process.env.FRONTEND_URL}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Assigned To</<strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${attendeeDetails?.name}</p>` +
      `<p style="color: #000 !important; margin:0px;">${attendeeDetails?.email}</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${meetingData.createdByDetail.name}` +
      `<br />${meetingData.createdByDetail.email} <br />` +
      "</strong></p>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<table width="100%" style="margin: 0 auto;" cellpadding="0" cellspacing="0" border="0">' +
      "<tbody>" +
      "<tr>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</tbody>" +
      "</table>" +
      "</div>" +
      "</div>";
    resolve(myVar);
  });


const reSendScheduledMeetingEmailTemplate = async (
  meetingData,
  attendeeName,
  logo,
  agendaData,
  attendeeData,
  attendee,
  rsvpStatus,
  hostingPassword,
  meetingLink,
  userData,
  hostKey
) =>
  new Promise(async (resolve, reject) => {
    try {
      let link = null;
      if (meetingLink) {
        link = meetingLink;
      } else {
        if (meetingData?.link) {
          link = meetingData?.link;
        }
      }

      const template = await EmailTemplate.findOne({
        templateType: "RESENDSCHEDULEMEETING",
        isActive: true,
      });

      if (!template) {
        return reject(
          new Error(`No active template found for type: RESENDSCHEDULEMEETING`)
        );
      }

      let mailBody = "";
      let body = "";
      let subject = "";

      if (template.reSendScheduledMeetingCredentials) {
        body = template.reSendScheduledMeetingCredentials.body || "";
        subject = template.subject;
      } else {
        return reject(
          new Error(`No body found for template type: ACTIONREOPEN`)
        );
      }

      body = body
        .replace(
          /{meetingdetailLink}/g,
          `${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}`
        )
        .replace(/{userManualLink}/g, process.env.USER_MANUAL_LINK)
        .replace(
          /{meetingMode}/g,
          commonHelper.convertFirstLetterToCapital(meetingData.mode)
        )
        .replace(/{meetingId}/g, meetingData?.meetingId)
        .replace(/{meetingTitle}/g, commonHelper.decryptWithAES(meetingData.title))
        .replace(/{meetingLink}/g, link)
        .replace(/{attendees}/g, attendeeData)
        .replace(/{agenda}/g, agendaData)
        .replace("{meetingDate}", new Date(meetingData.date).toDateString())
        .replace("{fromTime}", meetingData.fromTime)
        .replace("{toTime}", meetingData.toTime)
        .replace(
          /{meetingLocation}/g,
          meetingData.locationDetails?.isMeetingRoom === true
            ? meetingData?.roomDetail[0]?.title +
            " , " +
            meetingData?.roomDetail[0]?.location
            : meetingData?.locationDetails?.location
        )
        .replace(
          /{organizerName}/g,
          userData.name
        )

        .replace(/{organizerEmail}/g, meetingData.createdByDetail.email)
        .replace(
          /{replyLinkYes}/g,

          `<a style="margin-right:7px; color: #fff;" href="${process.env.FRONTEND_URL}/login/${meetingData?._id}/YES/${attendee?._id
          }">
            <button style="${rsvpStatus === "YES"
            ? "background-color: rgb(2, 2, 187);color: #fff;"
            : ""
          }">Yes</button>
          </a>`
        )
        .replace(
          /{replyLinkNo}/g,
          `<a style="margin-right:7px; color: #fff;" href="${process.env.FRONTEND_URL}/login/${meetingData?._id}/NO/${attendee?._id
          }">
          <button style="${rsvpStatus === "NO"
            ? "background-color: rgb(2, 2, 187);color: #fff;"
            : ""
          }">No</button>
        </a>`
        )
        .replace(
          /{replyLinkMaybe}/g,
          `<a style="margin-right:7px; color: #fff;" href="${process.env.FRONTEND_URL}/login/${meetingData?._id
          }/MAYBE/${attendee?._id}">
          <button style="${rsvpStatus === "MAYBE"
            ? "background-color: rgb(2, 2, 187);color: #fff;"
            : ""
          }">May Be</button>
        </a>`
        )

        .replace(
          /{hostingPassword}/g,
          hostingPassword !== null && hostingPassword !== ""
            ? `<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Link Password</strong></p>` +
            `<p style="color: #000 !important;margin:0px;">${hostingPassword}</p>`
            : `<p style="color: #000 !important;margin:0px;display:none;">NA</p>`
        )
        .replace(
          /{hostKey}/g,
          hostKey !== null && hostKey !== ""
            ? `<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Host Key</strong></p>` +
            `<p style="color: #000 !important;margin:0px;">${hostKey}</p>`
            : `<p style="color: #000 !important;margin:0px;display:none;">NA</p>`
        );

      subject = subject
        .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData.title))
        .replace("{meetingDate}", new Date(meetingData.date).toDateString())
        .replace("{fromTime}", meetingData.fromTime)
        .replace("{toTime}", meetingData.toTime)
        .replace("{organizerEmail}", userData.email);

      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>" +
        "</div>" +
        "</div>";

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });
    } catch (error) {
      reject(error);
    }
  });


const sendAttendanceDetailsEmailTemplate = async (
  meetingData,
  attendanceData,
  logo
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "SENDATTENDANCEDETAILS",
      isActive: true,
    });

    if (!template) {
      throw new Error("No active template found for type: SENDATTENDANCEDETAILS");
    }

   // let salutation = "";
    let body = "";
    let subject = "";

    if (template.sendAttendanceDetailsCredentials) {
     // salutation = template.dear;
      body = template.sendAttendanceDetailsCredentials.body;
      subject = template.subject;
    } else {
      throw new Error("No body found for template type: SENDATTENDANCEDETAILS");
    }

    // salutation = salutation.replace(
    //   "{name}",
    //   commonHelper.convertFirstLetterOfFullNameToCapital(attendeeName)
    // );

    body = body
      .replace("{meetingLink}", `${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}`)

      .replace("{meetingMode}", commonHelper.convertFirstLetterToCapital(meetingData.mode))
      .replace("{meetingId}", meetingData?.meetingId)
      .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData.title))
      .replace("{meetingDate}", new Date(meetingData.date).toDateString())
      .replace("{fromTime}", meetingData.fromTime)
      .replace("{toTime}", meetingData.toTime)
      .replace("{attendanceDetails}", attendanceData)


      .replace("{organizerName}", meetingData.createdByDetail.name)
      .replace("{organizerEmail}", meetingData.createdByDetail.email);

    subject = subject
      .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData.title))
      .replace("{meetingDate}", new Date(meetingData.date).toDateString())
      .replace("{fromTime}", meetingData.fromTime)
      .replace("{toTime}", meetingData.toTime)


    const mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin:0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      `</a>` +
      `<div style="padding: 20px; font-family: Arial, sans-serif; color: #000;">` +
      // `${salutation}` +
      `${body}` +
      `</div>` +
      `</div>` +
      `</div>` +
      `</div>`;

    console.log("Mail subject generated:", subject);
    console.log("Mail body generated:", mailBody);

    return { emailSubject: subject, mailData: mailBody };
  } catch (error) {
    console.error("Error generating email template:", error.message);
    throw error;
  }
};




const sendOtpEmailTemplate = (userData, otp, time, supportData, logo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({
        templateType: "LOGINSENDOTP",
        isActive: true,
      });

      if (!template) {
        return reject(
          new Error(`No active template found for type: LOGINSENDOTP`)
        );
      }

      let mailBody = "";
    //  let salutation = "";
      let body = "";
      let subject = "";

      if (template.loginsendOtpCredentials) {
        body = template.loginsendOtpCredentials.body || "";
      //  salutation = template.dear || "";
        subject = template.subject || "";
      } else {
        return reject(
          new Error(`No body found for template type: LOGINSENDOTP`)
        );
      }

      subject = subject
        .replace(/{name}/g, userData.name)
        .replace(/{expiryTime}/g, time)
        .replace("{otp}", otp);
    //  salutation = salutation.replace(/{name}/g, userData.name);
      body = body
        .replace("{otp}", otp)
        .replace(/{expiryTime}/g, time)
        .replace(/{name}/g, userData.name);

      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src='${logo}' alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>";
      ("</div>");
      ("</div>");

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });
    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
};

const organizationRegistrationSendOtpTemplate = async (
  name,
  otp,
  time,
  logo
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({
        templateType: "ORGANIZATIONREGISTRATIONSENDOTP",
        isActive: true,
      });

      if (!template) {
        return reject(
          new Error(
            `No active template found for type: ORGANIZATIONREGISTRATIONSENDOTP`
          )
        );
      }

      let mailBody = "";
      let body = "";
      let subject = "";

      if (template.organizationRegistrationSendOtpCredentials) {
        body = template.organizationRegistrationSendOtpCredentials.body || "";
        subject = template.subject;
      } else {
        return reject(
          new Error(
            `No body found for template type: ORGANIZATIONREGISTRATIONSENDOTP`
          )
        );
      }

      body = body
        .replace(
          /{name}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(name)
        )
        .replace(/{otp}/g, otp)
        .replace(/{expiryTime}/g, time);
      subject = subject
        .replace(
          "{name}",
          commonHelper.convertFirstLetterOfFullNameToCapital(name)
        )
        .replace("{otp}", otp)
        .replace("{expiryTime}", time);

      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>";
      ("</div>");
      ("</div>");

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });
    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
};

// Demo Send OTP Email template
const sendOtpDemoEmailTemplate = async (
  name,
  otp,
  time,
  supportData,
  logo,
  typeMessage
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "DEMOSENDOTP",
      isActive: true,
    });
    console.log("Template====", template);

    if (!template) {
      throw new Error(`No active template found for type: DEMOSENDOTP`);
    }

    let mailBody = "";
   // let salutation = "";
    let body = "";

    if (template.demoSendOtpCredentials) {
      body = template.demoSendOtpCredentials.body || "";
    //  salutation = template.dear || "";
      subject = template.subject;
    } else {
      throw new Error(`No body found for template type: DEMOSENDOTP`);
    }

   // salutation = salutation.replace("{name}", commonHelper.convertFirstLetterOfFullNameToCapital(name));
    body = body
      
      .replace("{otp}", otp)
      .replace( "{name}",commonHelper.convertFirstLetterOfFullNameToCapital(name))
      .replace("{expiryTime}", time);

    subject = subject
      .replace("{name}", commonHelper.convertFirstLetterOfFullNameToCapital(name))
      .replace("{typeMessage}", typeMessage);
    // mailBody = `${salutation}\n\n${body}\n`;
    mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>";
    ("</div>");
    ("</div>");
    console.log("User data", name);
    console.log("Mail data", mailBody);

    return { subject, mailBody };
  } catch (error) {
    console.error("Error generating OTP email:", error);
    throw error;
  }
};

// TEMPLATE TO SAVE DEMO DETAILS
const sendDemoInquiryEmailTemplate = async (
  name,
  email,
  phoneNo,
  message,
  logo,
  typeMessage
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "SAVEDEMODETAILS",
      isActive: true,
    });
    console.log("Template====", template);

    if (!template) {
      throw new Error("No active template found for type: SAVEDEMODETAILS");
    }

   // let salutation = "";
    let body = "";
    let subject = "";

    if (template.savedemoCredentials) {
      body = template.savedemoCredentials.body;
    //  salutation = template.dear;
      subject = template.subject;
    } else {
      throw new Error("No body found for template type: SAVEDEMODETAILS");
    }

   // salutation = salutation.replace( "{name}", commonHelper.convertFirstLetterOfFullNameToCapital(name));
    body = body
      .replace("{name}",  commonHelper.convertFirstLetterOfFullNameToCapital(name))
      .replace("{email}", email)
      .replace("{phoneNo}", phoneNo)
      .replace("{message}", message);
    subject = subject
      .replace( "{name}", commonHelper.convertFirstLetterOfFullNameToCapital(name) )
      .replace("{typeMessage}", typeMessage);

    // const mailBody = `\n${salutation}\n\n${body}\n`;
    mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>";
    ("</div>");
    ("</div>");
    console.log("Mail subject --------:", subject);
    console.log("Mail body --------:", mailBody);

    return { subject, mailBody };
  } catch (error) {
    console.error("Error generating Save demo email template:", error);
    throw error;
  }
};

// FUNCTION OF SEND ACTION REASSIGN REQUEST TEMPLATE

const actionReassignRequestEmailTemplate = async (
  meetingData,
  logo,
  requestDetails,
  actionDetails,
  assignedUserDetail
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "ACTIONREASSIGNREQUEST",
      isActive: true,
    });
    console.log("Template====", template);

    if (!template) {
      throw new Error(
        "No active template found for type: ACTIONREASSIGNREQUEST"
      );
    }

    let mailBody = "";
   // let salutation = "";
    let body = "";
    let subject = "";

    if (template.actionReassignRequestCredentials) {
      body = template.actionReassignRequestCredentials.body;
    //  salutation = template.dear;
      subject = template.subject;
    } else {
      throw new Error("No body found for template type: ACTIONREASSIGNREQUEST");
    }

  //  salutation = salutation.replace("{organizerName}",commonHelper.convertFirstLetterOfFullNameToCapital( meetingData?.createdByDetail?.name));
    body = body
    .replace("{organizerName}",commonHelper.convertFirstLetterOfFullNameToCapital( meetingData?.createdByDetail?.name))
      .replace( "{actionlink}",`${process.env.FRONTEND_URL}/view-action-detail/${actionDetails._id}`)
      .replace("{requestDetails}", requestDetails)
      .replace('{assignedUserName}', assignedUserDetail.name)
      .replace("{assignedUserEmail}", assignedUserDetail.email);

    //  subject = subject.replace('{organizerName}', meetingData?.createdByDetail?.name);
    subject = subject
      .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData.title))
      .replace("{organizerEmail}", meetingData.createdByDetail.email);

    console.log("Meeting Tittle====", commonHelper.decryptWithAES(meetingData.title));

    mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>";
    ("</div>");
    ("</div>");
    // console.log("Mail subject --------:", subject);
    console.log("Mail body --------:", mailBody);

    return { emailSubject: subject, mailData: mailBody };
  } catch (error) {
    console.error(
      "Error generating Action Reassign Request email template:",
      error
    );
    throw error;
  }
};

// FUNCTION OF ACTION APPROVE EMAIL TEMPLATE

const actionApproveEmailTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  reason,
  action
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "ACTIONAPPROVE",
      isActive: true,
    });
    console.log("Template====", template);

    if (!template) {
      throw new Error("No active template found for type: ACTIONAPPROVE");
    }

    let mailBody = "";
  //  let salutation = "";
    let body = "";
    let subject = "";

    if (template.actionApproveCredentials) {
      body = template.actionApproveCredentials.body;
    //  salutation = template.dear;
      subject = template.subject;
    } else {
      throw new Error("No body found for template type: ACTIONAPPROVE");
    }

  //  salutation = salutation.replace("{assignedUserName}", commonHelper.convertFirstLetterOfFullNameToCapital( assignedUserDetails?.name));
    
    body = body
      .replace("{assignedUserName}", commonHelper.convertFirstLetterOfFullNameToCapital( assignedUserDetails?.name))
      .replace( "{actionlink}",`${process.env.FRONTEND_URL}/view-action-detail/${action._id}`)
      .replace("{actionDescription}", commonHelper.decryptWithAES(action?.description))
      .replace("{approvalRemark}", reason)
      .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData.title))
      .replace("{meetingId}", meetingData.meetingId)
      .replace("{organizerName}",commonHelper.convertFirstLetterOfFullNameToCapital(meetingData.createdByDetail.name))
      .replace("{organizerEmail}", meetingData.createdByDetail.email);

    subject = subject.replace("{actionTitle}", commonHelper.decryptWithAES(action.title));

    console.log("Meeting Tittle====", commonHelper.decryptWithAES(meetingData.title));

    mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>";
    ("</div>");
    ("</div>");
    // console.log("Mail subject --------:", subject);
    console.log("Mail body --------:", mailBody);

    return { emailSubject: subject, mailData: mailBody };
  } catch (error) {
    console.error("Error generating Action Approve email template:", error);
    throw error;
  }
};

const sendContactUsEmailTemplate = async (
  name,
  email,
  phoneNo,
  message,
  logo,
  typeMessage
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "SAVECONTACTDETAILS",
      isActive: true,
    });
    console.log("Template====", template);

    if (!template) {
      throw new Error("No active template found for type: SAVECONTACTDETAILS");
    }

  //  let salutation = "";
    let body = "";
    let subject = "";

    if (template.saveContactCredentials) {
      body = template.saveContactCredentials.body;
    //  salutation = template.dear;
      subject = template.subject;
    } else {
      throw new Error("No body found for template type: SAVECONTACTDETAILS");
    }

    // salutation = salutation.replace(
    //   "{name}",
    //   commonHelper.convertFirstLetterOfFullNameToCapital(name)
    // );
    body = body
      .replace(
        "{name}",
        commonHelper.convertFirstLetterOfFullNameToCapital(name)
      )
      .replace("{email}", email)
      .replace("{phoneNo}", phoneNo)
      .replace("{message}", message);
    subject = subject
      .replace(
        "{name}",
        commonHelper.convertFirstLetterOfFullNameToCapital(name)
      )
      .replace("{typeMessage}", typeMessage);

    // const mailBody = `${salutation}\n\n${body}\n`;
    mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>";
    ("</div>");
    ("</div>");

    console.log("Mail subject generated:", subject);
    console.log("Mail body generated:", mailBody);

    return { subject, mailBody };
  } catch (error) {
    console.error("Error generating Contact Us email template:", error);
    throw error;
  }
};

const sendOtpContactEmailTemplate = async (
  name,
  otp,
  time,
  supportData,
  logo,
  typeMessage
) => {
  try {
    const template = await EmailTemplate.findOne({
      templateType: "CONTACTUS",
      isActive: true,
    });
    console.log("Template====", template);

    if (!template) {
      throw new Error(`No active template found for type: CONTACTUS`);
    }

  //  let salutation = "";
    let body = "";
    let subject = "";

    if (template.contactUsOtpCredentials) {
    //  salutation = template.dear || "";
      body = template.contactUsOtpCredentials.body || "";
      subject = template.subject || "";
    } else {
      throw new Error(`No credentials found for template type: CONTACTUS`);
    }

    // salutation = salutation.replace(
    //   "{name}",
    //   commonHelper.convertFirstLetterOfFullNameToCapital(name)
    // );
    body = body
      .replace("{otp}", otp)
      .replace("{expiryTime}", time)
      .replace(
        "{name}",
        commonHelper.convertFirstLetterOfFullNameToCapital(name)
      )
      .replace("{supportData}", supportData)
      .replace("{typeMessage}", typeMessage);

    subject = subject
      .replace(
        "{name}",
        commonHelper.convertFirstLetterOfFullNameToCapital(name)
      )
      .replace("{typeMessage}", typeMessage);

    // Combine salutation and body into the final mail body
    // const mailBody = `${salutation}\n\n${body}\n`;
    mailBody =
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
      `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
      `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
      "</a>" +
      `${body}` +
      "</div>";
    ("</div>");
    ("</div>");

    console.log("Mail subject generated:", subject);
    console.log("Mail body generated:", mailBody);

    return { subject, mailBody };
  } catch (error) {
    console.error("Error generating OTP email:", error);
    throw error;
  }
};



const actionCancelEmailTemplate = async (
  meetingData,
  logo,
  attendeeDetails,
  actionDetails
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({
        templateType: "ACTIONCANCEL",
        isActive: true,
      });

      if (!template) {
        return reject(
          new Error(`No active template found for type: ACTIONCANCEL`)
        );
      }

      let mailBody = "";
    //  let salutation = "";
      let body = "";
      let subject = "";

      if (template.actionCancelCredentials) {
        body = template.actionCancelCredentials.body || "";
       // salutation = template.dear || "";
        subject = template.subject || "";
      } else {
        return reject(
          new Error(`No body found for template type: ACTIONCANCEL`)
        );
      }

      console.log("Attendee Details:", attendeeDetails);
      console.log("Template Body Before Replace:", body);

      // salutation = salutation.replace(
      //   "{name}",
      //   commonHelper.convertFirstLetterOfFullNameToCapital(attendeeDetails.name)
      // );
      body = body
        .replace(
          "{actionlink}",
          `${process.env.FRONTEND_URL}/view-action-detail/${actionDetails._id}`
        )
        //.replace('{remark}', remark)
        .replace(
          /{name}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            attendeeDetails?.name
          )
        )
        .replace(/{email}/g, attendeeDetails?.email)
        .replace("{description}", commonHelper.decryptWithAES(actionDetails?.description))
        .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData?.title))
        .replace("{meetingId}", meetingData?.meetingId)
        .replace("{organizerEmail}", meetingData.createdByDetail.email)
        .replace(
          "{organizerName}",
          commonHelper.convertFirstLetterOfFullNameToCapital(
            meetingData.createdByDetail.name
          )
        );
      // .replace('{actionTitle}', actionDetails.title);
      subject = subject.replace("{actionTitle}", commonHelper.decryptWithAES(actionDetails.title));

      console.log("Final Body After Replace:", body);

      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>" +
        "</div>" +
        "</div>";

      console.log("Mail body that is here------", mailBody);

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });
    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
};

const actionCompleteEmailTemplate = async (  
  meetingData,
  logo,
  attendeeDetails,
  remark,
  userData,
  actionDetails) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({
        templateType: "ACTIONCOMPLETED",
        isActive: true,
      });

      if (!template) {
        return reject(
          new Error(`No active template found for type: ACTIONCOMPLETED`)
        );
      }

      let mailBody = "";
      // let salutation = "";
      let body = "";
      let subject = "";

      if (template.actionCompletedCredentials) {
        body = template.actionCompletedCredentials.body || "";
        subject = template.subject || "";
        // salutation = template.dear || "";
      } else {
        return reject(
          new Error(`No body found for template type: ACTIONCOMPLETED`)
        );
      }

    //  salutation = salutation.replace("{organizerName}",commonHelper.convertFirstLetterOfFullNameToCapital( meetingData.createdByDetail.name));
      
      subject = subject.replace("{actionTitle}", commonHelper.decryptWithAES(actionDetails?.title));
      console.log("Subject----",subject);
      console.log("actionDetails----",actionDetails);
      body = body
        .replace(
          "{actionlink}",
          `${process.env.FRONTEND_URL}/view-action-detail/${actionDetails._id}`
        )
        .replace("{remark}", remark)
        .replace(
          /{name}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            attendeeDetails?.name
          )
        )
        .replace(/{email}/g, attendeeDetails?.email)
        .replace("{description}", commonHelper.decryptWithAES(actionDetails?.description))
        .replace("{meetingTitle}", commonHelper.decryptWithAES(meetingData?.title))
        .replace("{meetingId}", meetingData?.meetingId)
        .replace("{organizerEmail}", meetingData.createdByDetail.email)
        .replace(
          /{organizerName}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            meetingData.createdByDetail.name
          )
        );
      console.log("Body ======", body);

      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>";
      ("</div>");
      ("</div>");

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });
    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
};


const registrationWelcomeMail = async (name, logo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({
        templateType: "ORGANIZATIONWELCOME",
        isActive: true,
      });

      if (!template) {
        return reject(
          new Error(`No active template found for type: ORGANIZATIONWELCOME`)
        );
      }

      let mailBody = "";
     // let salutation = "";
      let body = "";

      if (template.organizationWelcomCredentials) {
        body = template.organizationWelcomCredentials.body || "";
      //  salutation = template.dear || "";
      } else {
        return reject(
          new Error(`No body found for template type: ORGANIZATIONWELCOME`)
        );
      }

    //  salutation = salutation.replace("{name}",commonHelper.convertFirstLetterOfFullNameToCapital(name));
      
      body = body
      .replace("{name}",commonHelper.convertFirstLetterOfFullNameToCapital(name))
      .replace("{loginlink}", `${process.env.FRONTEND_URL}/login`);
      console.log("Body ======", body);

      mailBody =
        `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
        `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
        `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` +
        `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
        "</div>";
      ("</div>");
      ("</div>");

      resolve({
        emailSubject: template.subject,
        mailData: mailBody,
      });
    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
};


const actionAssignAdminEmailTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  action,
  userData
) =>{
  return new Promise(async (resolve, reject) => {
    try {
      const template = await EmailTemplate.findOne({ templateType: 'ACTIONASSIGNADMIN', isActive: true });

      if (!template) {
        return reject(new Error(`No active template found for type: ACTIONASSIGNADMIN`));
      }

      let mailBody = '';
      let subject = '';
      let body = '';

      if (template.actionAssignAdminCredentials) {
        body = template.actionAssignAdminCredentials.body || '';
        subject = template.subject || '';
      } else {
        return reject(new Error(`No body found for template type: ACTIONASSIGNADMIN`));
      }

      subject = subject.replace("{actionTitle}", commonHelper.decryptWithAES(action.title));
      body = body
        .replace(
          /{actionlink}/g,
          `${process.env.FRONTEND_URL}/view-action-detail/${action._id}`
        )
        .replace(
          /{name}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            meetingData.createdByDetail.name
          )
        )
        .replace(
          /{organizerName}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            userData.name
          )
        )
        .replace(/{organizerEmail}/g, userData.email)
        .replace(
          /{assignedUserName}/g,
          commonHelper.convertFirstLetterOfFullNameToCapital(
            assignedUserDetails?.name
          )
        )
       
      mailBody = 
      `<div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">` +
      `<div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">` +
      `<div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">` +
        `<a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">` + 
          `<img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />` +
        "</a>" +
        `${body}` +
      "</div>";
    "</div>";
    "</div>";

      resolve({
        emailSubject: subject,
        mailData: mailBody,
      });

    } catch (error) {
      console.error("Error generating OTP email template:", error);
      reject(error);
    }
  });
}


const sendDraftMeetingNotification = async (meetings, creator, logo) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Generating draft meeting notification email for:", creator.name);

      if (!Array.isArray(meetings)) {
        console.error("Error: meetings is not an array", meetings);
        return reject(new Error("meetings must be an array"));
      }

      let subject = `Reminder: Your Draft Meetings - ${meetings.length} Pending`;

      let meetingsList = meetings
        .map(
          (meeting) => `
            <li>
              <strong>${commonHelper.decryptWithAES(meeting.title)}</strong> (Created: ${new Date(meeting.createdAt).toDateString()})<br>
              <a href="${process.env.FRONTEND_URL}/view-meeting-details/${meeting._id}">View Meeting</a>
            </li>
          `
        )
        .join("");

      let body = `
        <p>Dear ${creator.name},</p>
        <p>You have the following draft meetings that have not been finalized:</p>
        <ul>${meetingsList}</ul>
        <p>Please complete or schedule them at your earliest convenience.</p>
        <p>Best regards,<br>Meeting Scheduler Team</p>
      `;

      let mailBody = `
        <div style="background-color:#e9f3ff;margin:0;padding:0px;width:100%">
          <div style="background-color:#e9f3ff;margin:0;padding:50px 0;width:100%">
            <div style="background-color:#fff;padding:30px;width:100%;max-width:640px;margin: 0 auto;">
              <a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">
                <img style="float: none; margin: 30px auto; display: block;" src="${logo}" alt="Logo" />
              </a>
              ${body}
            </div>
          </div>
        </div>
      `;

      //console.log("Mailbody-------", mailBody);

      resolve({
        emailSubject: subject,
        mailBody: mailBody,
      });
    } catch (error) {
      console.error("Error generating draft meeting email template:", error);
      reject(error);
    }
  });
};





module.exports = {
  //signInByOtpEmail,
  //updateMeeting,
  sendDraftMeetingNotification,

  sendAmendmentCreatedEmailTemplate,//later
  sampleTest, // no-need
  meetingRemindersEmailTemplate,//later
  sendActionDueReminderEmailTemplate,//later


  // Pratishruti
  sendOtpContactEmailTemplate, // c
  sendContactUsEmailTemplate, //c
  actionCompleteEmailTemplate, //c
  actionCancelEmailTemplate, //c
  registrationWelcomeMail, //c
  // generate mom
  sendCreateMinutesEmailTemplate, // c --- (child follw on re)
  sendReScheduledMeetingEmailTemplate, //c
  sendGiveWriteMOMPermissionEmailTemplate, //c
  sendCancelMeetingEmailTemplate,//c

  //Monalisa
  sendOtpEmailTemplate,  // c --done
  actionReassignEmailTemplate, //c  (action forward)---done
  actionAssignEmailTemplate, //c -- done
  organizationRegistrationSendOtpTemplate, //c (organization-signup-otp) -- done
  actionReOpenEmailTemplate, // c  (closed meeting) -- done
  reSendScheduledMeetingEmailTemplate, //c   --- (update)--- done
  acceptMinuteEmailTemplate, //c -- done
  actionReassignEmailToOlAssignedUserTemplate, //c  --- done
  actionAssignAdminEmailTemplate,  //c

  //Sunil
  sendOtpDemoEmailTemplate, // c
  sendDemoInquiryEmailTemplate, //c
  actionReassignRequestEmailTemplate, // c
  actionReassignRequestRejectEmailTemplate, //c
  createNewEmployeeEmailTemplate,
  actionApproveEmailTemplate, //c
  sendScheduledMeetingEmailTemplate, //c
  sendAttendanceDetailsEmailTemplate, // c
  actionReassignForOlAssigneeEmailTemplate,
}