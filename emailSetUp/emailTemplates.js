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

const sendOtpEmailTemplate = async (userData, otp, time, supportData, logo) =>
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
      `<img style="float: none; margin: 0 auto; display: block;"src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      `<p style="color: #000 !important">Dear ${userData.name},</p>` +
      '<p style="color: #000 !important">To ensure your accounts security and proceed with the login process, we require verification of your identity.</p>' +
      '<p style="color: #000 !important"> Please use the following OTP (One-Time Password) to verify your MinutesVault account.</p>' +
      '<p style="color: #000 !important"> OTP:<strong>'
      } ${otp}</strong></p>` +
      `<p style="color: #000 !important">Please enter this OTP in the designated field within ${time} minutes to complete the verification process.</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0"><strong>' +
      "Warm regards," +
      "<br />Team MinutesVault <br />" +
      "<strong></p>" +
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

const sendCancelMeetingEmailTemplate = async (
  meetingData,
  attendeeName,
  logo
) =>
  new Promise((resolve, reject) => {
    const myVar =
      `${'<div style="background-color: #e9f3ff;margin:0;padding:0; width:100%;">' +
      '<div style="background-color: #e9f3ff; width:100%;padding-bottom:60px">' +
      '<table style="margin-top:5px;margin-bottom:0;margin-right:auto;margin-left:auto;width:100%;max-width:640px" align="center" cellpadding="0" cellspacing="0" border="0">' +
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
      },</p>` +
      '<p style="color: #000 !important">This is to inform you that the meeting below has been cancelled. Please visit the below link for more details.</p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Title</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData?.title} (${meetingData?.meetingId})</p>` +
      '<p style="color: #000 !important; margin-bottom:0px"><strong>When (Cancelled)</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${new Date(
        meetingData.date
      ).toDateString()} ${meetingData.fromTime}
  -  ${meetingData.toTime}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Reason of Cancellation</strong></p>' +
      `<p style="color: #000 !important; margin:0px"">${meetingData.meetingStatus.remarks}</p>` +
      `<br />` +
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

const sendScheduledMeetingEmailTemplate = async (
  meetingData,
  attendeeName,
  logo,
  agendaData,
  attendeeData,
  attendee,
  hostingPassword,
  meetingLink,
  userData,
  hostKey
) =>
  new Promise((resolve, reject) => {
    let link = null;

    if (meetingLink) {
      link = meetingLink;
      console.log("meetingLink --->", meetingLink)
    } else {
      if (meetingData?.link) {
        link = meetingData?.link;
        console.log("meetingLink --->", link)
      }
    }

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
      },</p>` +
      '<p style="color: #000 !important">We hope this message finds you well. This is to inform you that a meeting has been scheduled through our MinutesVault application. </p>' +
      '<p style="color: #000 !important">Please make sure to mark your calendar accordingly. If you have any conflicts or questions regarding this meeting, feel free to reach out to the meeting organizer.</p>' +
      "<br />" +
      '<p style="color: #000 !important">Kindly refer to the link below to access the user manual for the login options.</p>' +
      `<p style="color: #000 !important">${process.env.USER_MANUAL_LINK}</p>` +
      "<br />" +
      '<p style="color: #000 !important">Thank you, and we look forward to your participation. Below are the details:</p>' +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Link</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Id</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData?.meetingId}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px"><strong>When </strong></p>' +
      //   `<p style="color: #000 !important; margin:0px;">${new Date(
      //     meetingData.date
      //   ).toDateString()} ${commonHelper.formatTimeFormat(meetingData.fromTime)}
      // -  ${commonHelper.formatTimeFormat(meetingData.toTime)}</p>` +
      `<p style="color: #000 !important; margin:0px;">${new Date(
        meetingData.date
      ).toDateString()}, ${meetingData.fromTime}
  -  ${meetingData.toTime}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" ><strong>Meeting Mode</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${commonHelper.convertFirstLetterToCapital(
        meetingData.mode
      )}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Joining Link</strong></p>' +
      `${link == null || ""
        ? `<p style="color: #000 !important;margin:0px;">Not Available</p>`
        : `<a style="margin:0px;" href="${link}">Click to join metting</a>`
      }` +
      `${hostingPassword !== null || ""
        ? '<p style="color: #000 !important; margin-bottom:0px;"><strong>Joining Link Password</strong></p>' +
        `<p style="color: #000 !important;margin:0px;">${hostingPassword}</p>`
        : `<p style="color: #000 !important;margin:0px;display:none;">NA</p>`
      }` +
      `${hostKey !== null || ""
        ? '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Host Key</strong></p>' +
        `<p style="color: #000 !important;margin:0px;">${hostKey}</p>`
        : `<p style="color: #000 !important;margin:0px;display:none;">NA</p>`
      }` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Location</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData.locationDetails?.isMeetingRoom === true
        ? meetingData?.roomDetail[0]?.title +
        " , " +
        meetingData?.roomDetail[0]?.location
        : meetingData?.locationDetails?.location
      }</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Attendees</strong></p>' +
      `<p style="color: #000 !important;margin:0px">${attendeeData}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Agenda(s)</strong></p>' +
      `${agendaData}` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Reply</strong></p>' +
      '<p style="color: #000 !important; margin:0px">' +
      `<a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/YES/${attendee?._id}><button>Yes</button></a><a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/NO/${attendee?._id}><button>No</button></a><a href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/MAYBE/${attendee?._id}><button>May Be</button></a>` +
      "</p>" +
      `<br />` +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${userData.name}` +
      `<br />${userData.email} <br />` +
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

const sendReScheduledMeetingEmailTemplate = async (
  meetingData,
  attendeeName,
  logo,
  agendaData,
  attendeeData,
  attendee,
  // hostingPassword,
  // meetingLink,
  hostingPassword,
  meetingLink,
  userData,
  hostKey
) =>
  new Promise((resolve, reject) => {
    let link = null;

    if (meetingLink) {
      link = meetingLink;
      console.log("meetingLink --->", link)
    } else {
      if (meetingData?.link) {
        link = meetingData?.link;
        console.log("meetingLink --->", link)
      }
    }

    console.log("meeting3Link --->", link)

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
      },</p>` +
      '<p style="color: #000 !important">This is to inform you that a meeting has been rescheduled.</p>' +
      '<p style="color: #000 !important"> Please find the updated details below:</p>' +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Link</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Title</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">
       
          ${commonHelper.convertFirstLetterToCapital(meetingData?.title)}(${meetingData?.meetingId
      })
        </p>` +
      '<p style="color: #000 !important; margin-bottom:0px"><strong>When (Rescheduled)</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${new Date(
        meetingData.date
      ).toDateString()}, ${meetingData.fromTime}
    -  ${meetingData.toTime}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Rescedule Reason</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">
   
      ${commonHelper.convertFirstLetterToCapital(
        meetingData?.meetingStatus?.remarks
      )}
    </p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" ><strong>Meeting Mode</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${commonHelper.convertFirstLetterToCapital(
        meetingData.mode
      )}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Joining Link</strong></p>' +
      `${link !== null || undefined || ""
        ? `<a style="margin:0px;" href="${link}">Click to join metting</a>`
        : '<p style="color: #000 !important;margin:0px;">Not Available</p>'
      }` +
      `${hostingPassword !== null || undefined || ""
        ? '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Link Password</strong></p>' +
        `<p style="color: #000 !important;margin:0px;">${hostingPassword}</p>`
        : `<p style="color: #000 !important;margin:0px;display:none;">NA</p>`
      }` +
      `${hostKey !== null || ""
        ? '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Host Key</strong></p>' +
        `<p style="color: #000 !important;margin:0px;">${hostKey}</p>`
        : `<p style="color: #000 !important;margin:0px;display:none;">NA</p>`
      }` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Location</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData.locationDetails?.isMeetingRoom === true
        ? meetingData?.roomDetail[0]?.title +
        " , " +
        meetingData?.roomDetail[0]?.location
        : meetingData?.locationDetails?.location
      }</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Attendees</strong></p>' +
      `<p style="color: #000 !important;margin:0px">${attendeeData}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Agenda(s)</strong></p>' +
      `${agendaData}` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Reply</strong></p>' +
      `<br />` +
      '<p style="color: #000 !important; margin:0px">' +
      `<a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/YES/${attendee?._id}><button>Yes</button></a><a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/NO/${attendee?._id}><button>No</button></a><a href=${process.env.FRONTEND_URL}/login/${meetingData?._id}/MAYBE/${attendee?._id}><button>May Be</button></a>` +
      `<br />` +
      `<br />` +
      "</p>" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${userData.name}` +
      `<br />${userData.email} <br />` +
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

const sendCreateMinutesEmailTemplate = async (
  meetingData,
  attendeeName,
  logo
) =>
  new Promise((resolve, reject) => {
    const attendeeData = meetingData?.attendees
      .map((attendee) => {
        return `${attendee.name}(${attendee.email})`;
      })
      .join(", ");
    let link = null;
    if (meetingData?.link) {
      link = meetingData?.link;
    }

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
      '<p style="color: #000 !important">Dear Attendee,'
      }</p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">Please find the MOM for the meeting held on ${new Date(
        meetingData.date
      ).toDateString()} ${meetingData.fromTime}
      -  ${meetingData.toTime}, titled "${meetingData.title}"</p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      '<p style="color: #000 !important">We kindly request you to review the minutes and provide your acceptance. Please note that the action window is open for the next 12 hours. After this period, all minutes will be considered accepted.</p>' +
      '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting or check the attached MOM.</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-minute-detail/${meetingData?._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Title</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData?.title} (${meetingData?.meetingId})</p>` +
      '<p style="color: #000 !important; margin-bottom:0px"><strong>When </strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${new Date(
        meetingData.date
      ).toDateString()}, ${meetingData.fromTime}
    -  ${meetingData.toTime}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" ><strong>Meeting Mode</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${commonHelper.convertFirstLetterToCapital(
        meetingData.mode
      )}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Link</strong></p>' +
      `${link !== null || ""
        ? `<a style="color: #000 !important;margin:0px;" href="${link}">${link}</a>`
        : '<p style="color: #000 !important;margin:0px;">Not Available</p>'
      }` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Location</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData.locationDetails?.isMeetingRoom === true
        ? meetingData?.roomDetail[0]?.title +
        ", " +
        meetingData?.roomDetail[0]?.location
        : meetingData?.locationDetails?.location
      }</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Attendees</strong></p>' +
      `<p style="color: #000 !important;margin:0px">${attendeeData}</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${meetingData?.createdByDetail?.name}` +
      `<br />${meetingData?.createdByDetail?.email} <br />` +
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

const actionReassignRequestEmailTemplate = async (
  meetingData,
  logo,
  requestDetails,
  userData,
  actionDetails
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
      `<p style="color: #000 !important">A request for forward of action has been generated. Please visit the link below to view the meeting and action details.</p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Action Link</strong></p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-action-detail/${actionDetails?._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;">Reason for Forward Request:</p>' +
      `<p style="color: #000 !important; margin:0px;">${requestDetails}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" >Your prompt attention to these requests is greatly appreciated.</p>' +
      "<br />" +
      `<p style="color: #000 !important;margin:0px;">Thank you for your co-operation.</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${userData.name}` +
      `<br />${userData.email} <br />` +
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

const actionReassignEmailToOlAssignedUserTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  reason,
  action,
  userData,
  oldAssignedUserDetails,

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
        oldAssignedUserDetails?.name
      )},</p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">An action has been forward to  ${commonHelper.convertFirstLetterOfFullNameToCapital(
        assignedUserDetails?.name
      )} (${assignedUserDetails?.email}). </p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Action Title</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${action?.title}</p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      // `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-action-detail/${action._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Reason for Forward:</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${reason}</p>` +
      // '<p style="color: #000 !important;margin-bottom:0px;" >Please make sure to complete the assigned tasks by the specified due dates. If you encounter any challenges or require assistance, please do not hesitate to reach out to me or the relevant team members.</p>' +
      // '<p style="color: #000 !important;margin-bottom:0px;" >Your prompt attention to these action items is greatly appreciated.</p>' +
      // `<p style="color: #000 !important;margin:0px;">Thank you for your co-operation.</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${userData.name}` +
      `<br />${userData.email} <br />` +
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

const actionReassignEmailTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  reason,
  userData,
  action
) =>
  new Promise((resolve, reject) => {
    console.log("userData2-->", userData)
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
      `<p style="color: #000 !important">An action has been forwarded to you. Please visit the link below to view the meeting and action details.
</p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-action-detail/${action._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Reason for Forward:</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${reason}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" >Please make sure to complete the assigned tasks by the specified due dates. If you encounter any challenges or require assistance, please do not hesitate to reach out to me or the relevant team members.</p>' +
      '<p style="color: #000 !important;margin-bottom:0px;" >Your prompt attention to these action items is greatly appreciated.</p>' +
      "<br />" +
      `<p style="color: #000 !important;margin:0px;">Thank you for your co-operation.</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${userData.name}` +
      `<br />${userData.email} <br />` +
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
const actionAssignEmailTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  action,
  userData
) =>
  new Promise((resolve, reject) => {

    console.log("meetingData Template", meetingData)

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
      `<p style="color: #000 !important">An action has been assigned to you. Please visit the link below to view the meeting and action details.
  </p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-action-detail/${action._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" >Please make sure to complete the assigned tasks by the specified due dates. If you encounter any challenges or require assistance, please do not hesitate to reach out to me or the relevant team members.</p>' +
      '<p style="color: #000 !important;margin-bottom:0px;" >Your prompt attention to these action items is greatly appreciated.</p>' +
      "<br />" +
      `<p style="color: #000 !important;margin:0px;">Thank you for your co-operation.</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${userData.name}` +
      `<br />${userData.email} <br />` +
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
const actionReOpenEmailTemplate = async (
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
      `<p style="color: #000 !important">An action has been reopened. Please visit the link below to view the action details.
  </p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-action-detail/${action._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Ttitle</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${meetingData?.title} (${meetingData?.meetingId})</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Action Title</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${action?.title}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Reason for Reopen</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${reason}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" >Your prompt attention to these action items is greatly appreciated.</p>' +
      `<p style="color: #000 !important;margin:0px;">Thank you for your co-operation.</p>` +
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
const actionApproveEmailTemplate = async (
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
      `<p style="color: #000 !important">An action has been approved. Please visit the link below to view the action details.
    </p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-action-detail/${action._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Title</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${meetingData?.title} (${meetingData?.meetingId})</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Action Title</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${action?.title}</p>` +
      `${reason !== (null || " " || undefined)
        ? '<p style="color: #000 !important;margin-bottom:0px;"><strong>Remark of Approval</strong></p>' +
        `<p style="color: #000 !important; margin:0px;">${reason}</p>`
        : null
      }` +
      '<p style="color: #000 !important;margin-bottom:0px;" >Your prompt attention to these action items is greatly appreciated.</p>' +
      `<p style="color: #000 !important;margin:0px;">Thank you for your co-operation.</p>` +
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

const acceptMinuteEmailTemplate = async (meetingData, attendeeDetails, logo) =>
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
      `<p style="color: #000 !important">We would like to inform you that MOM has been accepted by the below attendee.
  
          </p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      '<p style="color: #000 !important"><strong>MOM Details</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-minute-detail/${meetingData?._id}</p>` +
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
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Joining Link</strong></p>' +
      `${link == undefined || link == null || link == ""
        ? '<p style="color: #000 !important;margin:0px;">Not Available</p>'
        : `<a style="margin:0px;" href="${link}">Click to join metting</a>`
      }` +
      `${meetingData?.hostDetails?.hostingPassword !== undefined || null || ""
        ? '<p style="color: #000 !important; margin-bottom:0px;"><strong>Joining Link Password</strong></p>' +
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
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Attendees</strong></p>' +
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

const actionCancelEmailTemplate = async (
  meetingData,
  logo,
  attendeeDetails,
  actionDetails
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
      } ${attendeeDetails.name},</p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">We would like to inform you that the below action has been .</p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      // `<p style="color: #000 !important">${process.env.FRONTEND_URL}</p>` +

      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Action Link</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-action-detail/${actionDetails?._id}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Title</strong></p>' +
      `<p style="color: #000 !important; margin:0px">${meetingData?.title} (${meetingData?.meetingId})</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Action Description</strong></p>' +
      `<p style="color: #000 !important; margin:0px">${actionDetails?.description}</p>` +
      // '<p style="color: #000 !important;margin-bottom:0px;"><strong>Attendee:</strong></p>' +
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

const actionCompleteEmailTemplate = async (
  meetingData,
  logo,
  attendeeDetails,
  remarks,
  userData,
  actionDetails
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
      } ${meetingData.createdByDetail.name},</p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">The below assigned action is marked as completed by ${attendeeDetails?.name} (${attendeeDetails?.email}). Please find the action details below.</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Action Title</strong></p>' +
      `<p style="color: #000 !important; margin:0px">${actionDetails?.title}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;">Action Link</p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-action-detail/${actionDetails?._id}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Completion Remark</strong></p>' +
      `<p style="color: #000 !important; margin:0px">${remarks}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Title</strong></p>' +
      `<p style="color: #000 !important; margin:0px">${meetingData?.title} (${meetingData?.meetingId})</p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      // `<p style="color: #000 !important">${process.env.FRONTEND_URL}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Assigned To</<strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${attendeeDetails?.name}</p>` +
      `<p style="color: #000 !important; margin:0px;">${attendeeDetails?.email}</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${userData.name}` +
      `<br />${userData.email} <br />` +
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
      } ${attendeeDetails.name},</p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +

      `<p style="color: #000 !important">We would like to inform you that the Forward request has been rejected.</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Rejection Details</strong></p>' +
      `${remark !== null || ""
        ? `<p style="color: #000 !important; margin:0px;">${remark}</p>`
        : '<p style="color: #000 !important;margin:0px;">Not Available</p>'
      }` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Action Details</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-action-detail/${actionDetails?._id}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Title</strong></p>' +
      `<p style="color: #000 !important; margin:0px"">${meetingData?.title} (${meetingData?.meetingId})</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Action Title</strong></p>' +
      `<p style="color: #000 !important; margin:0px"">${actionDetails?.title}</p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      // `<p style="color: #000 !important">${process.env.FRONTEND_URL}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Assigned To</strong></p>' +
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

const createNewEmployeeEmailTemplate = async (adminDetails, logo, empData) =>
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
      } ${empData.name},</p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">We would like to inform you that your MinutesVault account has been successfully created with a username (${empData.email}).
</p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      '<p style="color: #000 !important">Please visit the below URL to login to your account. You can login with OTP or set up your account password.</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}</p>` +
      "<br />" +
      '<p style="color: #000 !important">Kindly refer to the link below to access the user manual for the login options.</p>' +
      `<p style="color: #000 !important">${process.env.USER_MANUAL_LINK}</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${adminDetails.name}` +
      `<br />${adminDetails.email} <br />` +
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

const sendGiveWriteMOMPermissionEmailTemplate = async (
  meetingData,
  attendeeName,
  logo
) =>
  new Promise((resolve, reject) => {
    const attendeeData = meetingData?.attendees
      .map((attendee) => {
        return `${attendee.name}(${attendee.email})`;
      })
      .join(", ");
    let link = null;
    if (meetingData?.link) {
      link = meetingData?.link;
    }

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
      } ${attendeeName},</p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +

      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      '<p style="color: #000 !important">We would like to inform you that permission to write MOM has been added to your MinutesVault account for the below meeting. You are now able to write minutes.</p>' +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Title</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData.title} (${meetingData?.meetingId})</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Details</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}</p>` +
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
      `<p style="color: #000 !important;margin:0px;">Thank you for your co-operation.</p>` +
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
      `<p style="color: #000 !important; margin:0px">${actionDetails?.description}</p>` +
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
  new Promise((resolve, reject) => {
    let link = null;
    if (meetingLink) {
      link = meetingLink;
    } else {
      if (meetingData?.link) {
        link = meetingData?.link;
      }
    }

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
      },</p>` +
      '<p style="color: #000 !important">We hope this message finds you well. This is to inform you that a meeting has been scheduled through our Meeting Minutes application. </p>' +
      '<p style="color: #000 !important">Please make sure to mark your calendar accordingly. If you have any conflicts or questions regarding this meeting, feel free to reach out to the meeting organizer.</p>' +
      "<br />" +
      '<p style="color: #000 !important">Kindly refer to the link below to access the user manual for the login options.</p>' +
      `<p style="color: #000 !important">${process.env.USER_MANUAL_LINK}</p>` +
      "<br />" +
      '<p style="color: #000 !important">Thank you, and we look forward to your participation. Below are the details:</p>' +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Link</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Id</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData?.meetingId}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px"><strong>When </strong></p>' +
      //   `<p style="color: #000 !important; margin:0px;">${new Date(
      //     meetingData.date
      //   ).toDateString()} ${commonHelper.formatTimeFormat(meetingData.fromTime)}
      // -  ${commonHelper.formatTimeFormat(meetingData.toTime)}</p>` +
      `<p style="color: #000 !important; margin:0px;">${new Date(
        meetingData.date
      ).toDateString()}, ${meetingData.fromTime}
  -  ${meetingData.toTime}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" ><strong>Meeting Mode</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${commonHelper.convertFirstLetterToCapital(
        meetingData.mode
      )}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Joining Link</strong></p>' +
      `${link !== null || ""
        ? `<a style="color: #000 !important;margin:0px;" href="${link}">${link}</a>`
        : '<p style="color: #000 !important;margin:0px;">Not Available</p>'
      }` +
      `${hostingPassword !== null || ""
        ? '<p style="color: #000 !important; margin-bottom:0px;"><strong>Joining Link Password</strong></p>' +
        `<p style="color: #000 !important;margin:0px;">${hostingPassword}</p>`
        : `<p style="color: #000 !important;margin:0px;display:none;">NA</p>`
      }` +
      `${hostKey !== null || ""
        ? '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Host Key</strong></p>' +
        `<p style="color: #000 !important;margin:0px;">${hostKey}</p>`
        : `<p style="color: #000 !important;margin:0px;display:none;">NA</p>`
      }` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Location</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData.locationDetails?.isMeetingRoom === true
        ? meetingData?.roomDetail[0]?.title +
        " , " +
        meetingData?.roomDetail[0]?.location
        : meetingData?.locationDetails?.location
      }</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Attendees</strong></p>' +
      `<p style="color: #000 !important;margin:0px">${attendeeData}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Agenda(s)</strong></p>' +
      `${agendaData}` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Reply</strong></p>' +
      '<p style="color: #000 !important; margin:0px">' +
      `<a style="margin-right:10px;" href=${process.env.FRONTEND_URL}/login/${meetingData?._id
      }/YES/${attendee?._id}><button style="${rsvpStatus === "YES"
        ? "background-color: rgb(2, 2, 187);color: #fff;"
        : ""
      }">Yes</button></a><a style="margin-right:10px;" href=${process.env.FRONTEND_URL
      }/login/${meetingData?._id}/NO/${attendee?._id}><button style="${rsvpStatus === "NO"
        ? "background-color: rgb(2, 2, 187);color: #fff;"
        : ""
      }">No</button></a><a href=${process.env.FRONTEND_URL}/login/${meetingData?._id
      }/MAYBE/${attendee?._id}><button style="${rsvpStatus === "MAYBE"
        ? "background-color: rgb(2, 2, 187);color: #fff;"
        : ""
      }">May Be</button></a>` +
      "</p>" +
      `<br />` +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${userData.name}` +
      `<br />${userData.email} <br />` +
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

const sendOtpDemoEmailTemplate = async (
  name,
  otp,
  time,
  supportData,
  logo,
  typeMessage
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
      `<img style="float: none; margin: 0 auto; display: block;"src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      `<p style="color: #000 !important">Dear ${name},</p>` +
      `<p style="color: #000 !important">${typeMessage}</p>` +
      '<p style="color: #000 !important"> OTP:<strong>'
      } ${otp}</strong></p>` +
      `<p style="color: #000 !important">Please enter this OTP in the designated field within ${time} minutes to complete the verification process.</p>` +
      '<p style="color: #000 !important">If you didn’t request this, please disregard this email.</p>' +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0"><strong>' +
      "Warm regards," +
      "<br />Team MinutesVault <br />" +
      "<strong></p>" +
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

const organizationRegistrationSendOtpTemplate = async (name, otp, time, logo) =>
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
      `<img style="float: none; margin: 0 auto; display: block;"src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      `<p style="color: #000 !important">Dear ${name},</p>` +
      '<p style="color: #000 !important"> OTP:<strong>'
      } ${otp}</strong></p>` +
      `<p style="color: #000 !important">Please enter this OTP in the designated field within ${time} minutes to complete the verification process.</p>` +
      '<p style="color: #000 !important">If you didn’t request this, please disregard this email.</p>' +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0"><strong>' +
      "Warm regards," +
      "<br />Team MinutesVault <br />" +
      "<strong></p>" +
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

const sendAttendanceDetailsEmailTemplate = async (
  meetingData,
  attendanceData,
  logo,
  attendeeEmail
) =>



  new Promise((resolve, reject) => {
    let userType = null;
    if (meetingData.createdByDetail.email == attendeeEmail) {
      userType = "Admin";
    } else {
      userType = "Attendee";
    }
    console.log(attendeeEmail, userType)
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
      `<p style="color: #000 !important">Dear ${userType}`
      },</p>` +
      '<p style="color: #000 !important">We hope this message finds you well. This is to inform you that a meeting has been finished through our MinutesVault application. </p>' +
      '<p style="color: #000 !important">Thank you, and we look forward to your participation in further meetings. Below are the Meeting with attendance details:</p>' +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Meeting Link</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/view-meeting-details/${meetingData?._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;"><strong>Meeting Id</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${meetingData?.meetingId}</p>` +
      '<p style="color: #000 !important; margin-bottom:0px"><strong>When </strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${new Date(
        meetingData.date
      ).toDateString()}, ${meetingData.fromTime}
      -  ${meetingData.toTime}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" ><strong>Meeting Mode</strong></p>' +
      `<p style="color: #000 !important;margin:0px;">${commonHelper.convertFirstLetterToCapital(
        meetingData.mode
      )}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px"><strong>Attendance Details</strong></p>' +
      `${attendanceData}` +
      `<br />` +
      '<p style="color: #000 !important; margin-top:0"><strong>' +
      "Warm regards," +
      "<br />Team MinutesVault <br />" +
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

const sendDemoInquiryEmailTemplate = async (
  name,
  email,
  phoneNo,
  message,
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
      `<img style="float: none; margin: 0 auto; display: block;"src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      '<p style="color: #000 !important">Dear Admin'
      },</p>` +
      '<p style="color: #000 !important">A new demo inquiry has been received for the MinutesVault application. Please find the customer details below.</p>' +
      '<p style="color: #000 !important"><strong>Customer Details</strong></p>' +
      `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">` +
      `<tr style="border: 1px solid black;border-collapse: collapse;" >` +
      `<td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6"><strong>Customer Name</strong></td>` +
      `<td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${name}</td></tr>` +
      `<tr style="border: 1px solid black;border-collapse: collapse;" >` +
      `<td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6"><strong>Email</strong></td>` +
      `<td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${email}</td></tr>` +
      `<tr style="border: 1px solid black;border-collapse: collapse;" >` +
      `<td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6"><strong>Phone Number</strong></td>` +
      `<td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${phoneNo}</td></tr>` +
      `<tr style="border: 1px solid black;border-collapse: collapse;" >` +
      `<td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6"><strong>Message</strong></td>` +
      `<td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${message}</td></tr>` +
      `</table>` +
      '<p style="color: #000 !important">Please reach out to the customer promptly to respond to the inquiry.</p>' +
      '<p style="color: #000 !important; margin-top:0"><strong>' +
      "Warm regards," +
      "<br />Team MinutesVault <br />" +
      "<strong></p>" +
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

const sendContactUsEmailTemplate = async (
  name,
  email,
  phoneNo,
  message,
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
      `<img style="float: none; margin: 0 auto; display: block;"src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      '<p style="color: #000 !important">Dear Admin'
      },</p>` +
      '<p style="color: #000 !important">A new contact inquiry has been received for the MinutesVault application. Please find the customer details below.</p>' +
      '<p style="color: #000 !important"><strong>Customer Details</strong></p>' +
      `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">` +
      `<tr style="border: 1px solid black;border-collapse: collapse;" >` +
      `<td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6"><strong>Customer Name</strong></td>` +
      `<td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${name}</td></tr>` +
      `<tr style="border: 1px solid black;border-collapse: collapse;" >` +
      `<td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6"><strong>Email</strong></td>` +
      `<td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${email}</td></tr>` +
      `<tr style="border: 1px solid black;border-collapse: collapse;" >` +
      `<td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6"><strong>Phone Number</strong></td>` +
      `<td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${phoneNo}</td></tr>` +
      `<tr style="border: 1px solid black;border-collapse: collapse;" >` +
      `<td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6"><strong>Message</strong></td>` +
      `<td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${message}</td></tr>` +
      `</table>` +
      '<p style="color: #000 !important">Please reach out to the customer promptly to address their inquiry.</p>' +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0"><strong>' +
      "Warm regards," +
      "<br />Team MinutesVault <br />" +
      "<strong></p>" +
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

const organizationRegistration = async (name, logo) =>
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
      `<img style="float: none; margin: 0 auto; display: block;"src=${logo}>` +
      "</a>" +
      "</span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse:collapse;color:#545d5e;font-family:Arial,Tahoma,Verdana,sans-serif;font-size:14px;margin:0;text-align:left;line-height:165%;letter-spacing:0;padding-top:20px;padding-bottom:30px;padding-left: 30px;padding-right: 30px;">' +
      `<p style="color: #000 !important">Dear ${name},</p>`
      }</p>` +
      '<p style="color: #000 !important">Welcome to the MinutesVault application. Please find the login credential below.</p>' +
      `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">` +
      `<tr style="border: 1px solid black;border-collapse: collapse;" >` +
      '<p style="color: #000 !important; margin-bottom:0px;"><strong>Log In By OTP Link</strong></p>' +
      `<p style="color: #000 !important; margin:0px;">${process.env.FRONTEND_URL}/login</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0"><strong>' +
      "Warm regards," +
      "<br />Team MinutesVault <br />" +
      "<strong></p>" +
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


const registrationWelcomeMail = async (name, logo) =>
  new Promise((resolve, reject) => {
    const myVar = `
        <div style="background-color: #e9f3ff; margin: 0; padding: 0; width: 100%;">
          <div style="background-color: #e9f3ff; width: 100%; padding-bottom: 60px;">
            <table style="margin: 0 auto; width: 100%; max-width: 640px;" align="center" cellpadding="0" cellspacing="0" border="0">
              <tbody>
                <tr>
                  <td valign="middle" align="center" height="60" style="border-collapse: collapse;"></td>
                </tr>
              </tbody>
            </table>
            <table cellspacing="0" cellpadding="0" style="width: 100%; max-width: 640px; margin: 0 auto;">
              <tbody>
                <tr>
                  <td>
                    <table cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF">
                      <tbody>
                        <tr>
                          <td>
                            <table border="0" style="margin: 0 auto;" cellspacing="0" cellpadding="0" width="100%" bgcolor="#FFFFFF" valign="center" align="center">
                              <tbody>
                                <tr>
                                  <td style="padding: 30px 0px 30px; color: #545d5e; font-family: Helvetica; font-size: 12px; line-height: 180%; vertical-align: top; text-align: center;">
                                    <span>
                                      <a href="${process.env.TARGET_WEBSITE}" style="width: 100%; text-align: center;">
                                        <img style="float: none; margin: 0 auto; display: block;" src="${logo}" alt="Logo">
                                      </a>
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td valign="center" cellpadding="0" align="center" bgcolor="#FFFFFF" style="border-collapse: collapse; color: #545d5e; font-family: Arial, Tahoma, Verdana, sans-serif; font-size: 14px; margin: 0; text-align: left; line-height: 165%; letter-spacing: 0; padding-top: 20px; padding-bottom: 30px; padding-left: 30px; padding-right: 30px;">
                                    <p style="color: #000 !important;">Dear ${name},</p>
                                    <p style="color: #000 !important;">Welcome to the MinutesVault application! We're thrilled to have you on board. Explore the platform and discover how it simplifies your experience.</p>
                                    <p style="color: #000 !important;">If you have any questions, feel free to reach out to us anytime.</p>
                                    <p style="color: #000 !important; margin-top: 20px;"><strong>Warm regards,</strong><br />Team MinutesVault</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <table width="100%" style="margin: 0 auto;" cellpadding="0" cellspacing="0" border="0">
                                      <tbody>
                                        <tr>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>`;
    resolve(myVar);
  });


const actionAssignAdminEmailTemplate = async (
  meetingData,
  logo,
  assignedUserDetails,
  action,
  userData
) =>
  new Promise((resolve, reject) => {

    console.log("meetingData Template", meetingData)

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
        meetingData.createdByDetail.name
      )},</p>` +
      // `<p style="color: #000 !important">As a follow-up to our recent meeting, I am pleased to provide the confirmed meeting minutes for ${
      //   meetingData.title
      // }, which took place on ${new Date(
      //   meetingData.date
      // ).toDateString()} ${meetingData.fromTime}
      // -  ${meetingData.toTime}.</p>` +
      `<p style="color: #000 !important">An action has been assigned to ${commonHelper.convertFirstLetterOfFullNameToCapital(assignedUserDetails?.name)} by ${commonHelper.convertFirstLetterOfFullNameToCapital(userData.name)}. Please visit the link below to view the meeting and action details.
    </p>` +
      // '<p style="color: #000 !important">We request you to kindly review the minutes and take necessary actions like accept or reject or request for amendment if any.We would like to mention that the action window will be open for the next 12 hours and post that all minutes will be treated as accepted.</p>' +
      // '<p style="color: #000 !important">Please log in with the below URL to view the minutes of the meeting.</p>' +
      `<p style="color: #000 !important">${process.env.FRONTEND_URL}/view-action-detail/${action._id}</p>` +
      '<p style="color: #000 !important;margin-bottom:0px;" >Please make sure to complete the assigned tasks by the specified due dates. If you encounter any challenges or require assistance, please do not hesitate to reach out to me or the relevant team members.</p>' +
      '<p style="color: #000 !important;margin-bottom:0px;" >Your prompt attention to these action items is greatly appreciated.</p>' +
      "<br />" +
      `<p style="color: #000 !important;margin:0px;">Thank you for your co-operation.</p>` +
      "<br />" +
      '<p style="color: #000 !important; margin-top:0;margin-bottom:0px"><strong>' +
      "Regards," +
      `<br />${userData.name}` +
      `<br />${userData.email} <br />` +
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


module.exports = {
  //signInByOtpEmail,
  //updateMeeting,
  sendOtpEmailTemplate,
  sendOtpDemoEmailTemplate,
  sendContactUsEmailTemplate,
  sendCancelMeetingEmailTemplate,
  sendScheduledMeetingEmailTemplate,
  sendCreateMinutesEmailTemplate,
  sendReScheduledMeetingEmailTemplate,
  actionReassignRequestEmailTemplate,
  actionReassignEmailTemplate,
  actionReOpenEmailTemplate,
  actionApproveEmailTemplate,
  sendAmendmentCreatedEmailTemplate,
  acceptMinuteEmailTemplate,
  meetingRemindersEmailTemplate,
  actionCancelEmailTemplate,
  actionCompleteEmailTemplate,
  actionReassignRequestRejectEmailTemplate,
  sampleTest,
  createNewEmployeeEmailTemplate,
  sendGiveWriteMOMPermissionEmailTemplate,
  actionReassignForOlAssigneeEmailTemplate,
  sendActionDueReminderEmailTemplate,
  actionReassignEmailToOlAssignedUserTemplate,
  reSendScheduledMeetingEmailTemplate,
  sendOtpDemoEmailTemplate,
  sendAttendanceDetailsEmailTemplate,
  sendDemoInquiryEmailTemplate,
  organizationRegistrationSendOtpTemplate,
  organizationRegistration,
  actionAssignEmailTemplate,
  registrationWelcomeMail,
  actionAssignAdminEmailTemplate
};


