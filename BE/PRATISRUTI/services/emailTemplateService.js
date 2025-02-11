const EmailTemplate = require("../models/emailTemplateModel");

const updateEmailTemplate = async (organizationId, data) => {
  const {
    templateType,
    subject,
    templateName,
    body,
    moduleName,
  } = data;

  const query = { organizationId: String(organizationId), templateType };
  let template = await EmailTemplate.findOne(query);

  let isNewRecord = false;

  const templateParameters = {
    "DEMOSENDOTP": ["{name}", "{otp}", "{expiryTime}"],
    "CONTACTUS": ["{name}", "{otp}", "{expiryTime}"],
    "LOGINSENDOTP": ["{name}", "{otp}", "{expiryTime}"],
    "SAVEDEMODETAILS": ["{name}", "{email}", "{phoneNo}", "{message}"],
    "SAVECONTACTDETAILS": ["{name}", "{email}", "{phoneNo}", "{message}"],
    "ACTIONFORWARDED": ["{name}", "{actionlink}", "{reason}", "{organizerName}", "{organizerEmail}", "{actionTitle}"],
    "ACTIONASSIGN": ["{name}", "{actionlink}", "{organizerName}", "{organizerEmail}", "{actionTitle}"],
    "ACTIONCOMPLETED": ["{organizerName}", "{email}", "{actionTitle}", "{actionlink}", "{remark}", "{description}",
      "{meetingTitle}", "{meetingId}", "{organizerName}", "{organizerEmail}"],
    "ACTIONREASSIGNREQUEST": ["{actionlink}", "{requestDetails}", "{organizerName}",
      "{organizerEmail}", "{meetingTitle}", "{assignedUserName}", "{assignedUserEmail}"],
    "ACTIONCANCEL": ["{name}", "{email}", "{actionlink}", "{remark}", "{description}",
      "{meetingTitle}", "{meetingId}", "{organizerName}", "{organizerEmail}", "{actionTitle}"],
    "ACTIONREASSIGNREQUESTREJECT": ["{actionlink}", "{requestDetails}", "{organizerName}",
      "{organizerEmail}", "{meetingTitle}", "{meetingId}", "{assignedUserName}", "{assignedUserEmail}",
      "{description}", "{rejectReason}"],
    "ADDEMPLOYEE": ["{organizationName}", "{employeeName}", "{employeeEmail}", "{frontendUrlLink}",
      "{userManualLink}", "{adminName}", "{adminEmail}"],
    "ORGANIZATIONWELCOME": ["{name}", "{loginlink}"],
    "ORGANIZATIONREGISTRATIONSENDOTP": ["{name}", "{otp}", "{expiryTime}"],
    "ACTIONREOPEN": ["{name}", "{actionTitle}", "{actionlink}", "{description}", "{reason}", "{organizerName}",
      "{organizerEmail}", "{meetingTitle}", "{meetingId}"],
    "ACTIONAPPROVE": ["{actionTitle}", "{assignedUserName}", "{actionlink}", "{meetingTitle}", "{meetingId}",
      "{actionDescription}", "{approvalRemark}", "{organizerName}", "{organizerEmail}"],

    "GENERATEMOM": ["{meetingDate}", "{fromTime}", "{meetingTitle}", "{toTime}", "{link}","{meetingId}",
      "{meetingMode}","{meetingLink}","{meetingLocation}","{attendees}","{createdByName}","{createdByEmail}"],

    "RESCHEDULE":["{meetingDate}", "{fromTime}", "{meetingTitle}", "{toTime}", "{link}","{meetingId}","{hostingPassword}","{agendaData}","{replyLinkYes}" ,"{replyLinkNo}", "{replyLinkMaybe}",
      "{meetingMode}","{meetingLink}","{meetingLocation}","{attendees}","{createdByName}","{createdByEmail}","{rescheduleReason}"],
    
    "RESENDSCHEDULEMEETING":["{userManualLink}", "{meetingdetailLink}", "{meetingId}", "{meetingDate}", "{fromTime}", "{meetingTitle}", "{toTime}",
      "{meetingMode}","{meetingLink}","{meetingLocation}","{attendees}", "{agenda}", "{organizerName}", "{organizerEmail}", "{hostingPassword}", "{hostKey}", "{replyLinkYes}" ,"{replyLinkNo}", "{replyLinkMaybe}"],
    
    "SENDSCHEDULEMEETING":["{meetingdetailLink}", "{userManualLink}", "{meetingId}", "{meetingDate}", "{fromTime}", "{meetingTitle}", "{toTime}",
      "{meetingMode}","{meetingLink}","{meetingLocation}","{attendees}", "{agenda}","{yes}", "{no}", "{mayBe}", "{organizerName}", "{organizerEmail}"],

    "GIVEWRITMOMPERMISSION":["{meetingTitle}", "{attendeeName}", "{meetingId}", "{meetingLink}", "{createdByName}", "{createdByEmail}"],
  
    "ACCEPTMINUTES":["{meetingTitle}", "{minuteDetailLink}", "{attendeeName}", "{attendeeEmail}", "{organizerName}", "{organizerEmail}"],
    
    "SENDATTENDANCEDETAILS": ["{meetingId}", "{meetingDate}", "{fromTime}", "{meetingTitle}", "{toTime}",
      "{meetingMode}","{meetingLink}","{attendanceDetails}", "{organizerName}", "{organizerEmail}"],

    "MEETINGCANCEL":["{meetingTitle}","{meetingId}", "{meetingDate}", "{fromTime}", "{toTime}", "{cancellationReason}", "{createdByName}","{createdByEmail}"],
      
   "ACTIONREASSIGNTOOLDUSER": ["{meetingTitle}", "{oldAssignedUserName}", "{assignedUserName}", "{assignedUserEmail}", "{organizerName}", "{organizerEmail}", 
    "{actionDescription}", "{reason}"],
    
    "ACTIONASSIGNADMIN": ["{name}", "{actionTitle}", "{assignedUserName}", "{actionlink}", "{organizerName}", "{organizerEmail}"],
   
};

  const templateCredentials = {
    "DEMOSENDOTP": "demoSendOtpCredentials",
    "CONTACTUS": "contactUsOtpCredentials",
    "LOGINSENDOTP": "loginsendOtpCredentials",
    "SAVEDEMODETAILS": "savedemoCredentials",
    "SAVECONTACTDETAILS": "saveContactCredentials",
    "ACTIONFORWARDED": "actionForwardedCredentials",
    "ACTIONASSIGN": "actionAssignCredentials",
    "ACTIONCOMPLETED": "actionCompletedCredentials",
    "ACTIONREASSIGNREQUEST": "actionReassignRequestCredentials",
    "ACTIONCANCEL": "actionCancelCredentials",
    "ACTIONREASSIGNREQUESTREJECT": "actionReassignRequestRejectCredentials",
    "ADDEMPLOYEE": "addEmployeeCredentials",
    "ORGANIZATIONWELCOME": "organizationWelcomCredentials",
    "ORGANIZATIONREGISTRATIONSENDOTP": "organizationRegistrationSendOtpCredentials",
    "GENERATEMOM": "generateMomCredentials",
    "ACTIONREOPEN": "actionReOpenCredentials",
    "ACTIONAPPROVE": "actionApproveCredentials",
    "RESCHEDULE":"rescheduleCredentials",
    "RESENDSCHEDULEMEETING":"reSendScheduledMeetingCredentials",
    "SENDSCHEDULEMEETING":"sendScheduledMeetingCredentials",
    "GIVEWRITMOMPERMISSION":"giveWritemomPermissionCredentials",
    "ACCEPTMINUTES":"acceptMinutesCredentials",
    "SENDATTENDANCEDETAILS": "sendAttendanceDetailsCredentials",
    "MEETINGCANCEL":"meetingCancelCredentials",
    "ACTIONREASSIGNTOOLDUSER": "actionAssignToOldAssignedUserCredentials",
    "ACTIONASSIGNADMIN": "actionAssignAdminCredentials",
    
  };

  if (!template) {
    isNewRecord = true;
    template = new EmailTemplate({
      organizationId: String(organizationId),
      templateType,
      moduleName,
      templateName,
      subject,
      body,
      parameter: templateParameters[templateType] || [],
    });

    if (templateCredentials[templateType]) {
      template[templateCredentials[templateType]] = {
        body,
      };
    }
  } else {
    template.subject = subject;
    template.templateName = templateName;
    template.body = body;
    template.parameter = templateParameters[templateType] || [];

    if (templateCredentials[templateType]) {
      template[templateCredentials[templateType]] = {
        ...template[templateCredentials[templateType]],
        body,
      };
    }
  }

  const result = await template.save();
  return { result, isNewRecord };
};


const getAllEmailTemplates = async (organizationId) => {
  if (!organizationId) {
    throw new Error("Organization ID is required.");
  }
  const result = await EmailTemplate.find({ organizationId, isActive: true }).sort({ createdAt: -1 });
  const totalCount = await EmailTemplate.countDocuments({ organizationId, isActive: true });

  return { result, totalCount };
};


const getEmailTemplateByType = async (templateType) => {
  const emailTemplate = await EmailTemplate.find({ templateType });
  return emailTemplate;
};

module.exports = {
  getAllEmailTemplates,
  getEmailTemplateByType,
  updateEmailTemplate,
};