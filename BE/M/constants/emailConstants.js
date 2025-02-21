const requestDemoOtpMessage =
  "Thank you for your interest in scheduling a demo with MinutesVault! Before we proceed, please verify your email address by using the following One-Time Password (OTP).";
const contactUsMessage =
  "Thank you for your interest in contacting MinutesVault! Before we proceed, please verify your email address by using the following One-Time Password (OTP).";
const signInOtpsubject = "MinutesVault OTP Verification";
const requestDemoOtpSubject =
  "OTP to Verify Your Email to Schedule a Demo with MinutesVault";
const contactUsOtpSubject =
  "OTP to Verify Your Email to Contact with MinutesVault";
const demoServeySubject = (customerName) => {
  return `MinutesVault Demo Inquiry Received from: (${customerName})`;
};
const contactUsSubject = (customerName) => {
  return `MinutesVault Contact Inquiry Received from: (${customerName})`;
};
const updateMeetingSubject = "Meeting has been updated!";
const createMeetingSubject = "A new meeting is created!";
const organizationRegistrationOtpSubject =
  "OTP to Verify Your Email for request a Demo with MinutesVault";
const sendAttendanceDetailsSubject = async (meetingData) => {
  return ` Attendance Details : (Meeting Title: ${meetingData.title
    }, Scheduled On: ${new Date(meetingData.date).toDateString()}
     ${meetingData.fromTime}
    -  ${meetingData.toTime})`;
};

const cancelMeetingSubject = async (meetingData) => {
  return ` Meeting Cancelled : (Meeting Title: ${meetingData.title
    }, Scheduled On: ${new Date(meetingData.date).toDateString()}
     ${meetingData.fromTime}
    -  ${meetingData.toTime})`;
};

const scheduleMeetingSubject = (meetingData) => {
  return `Invitation : ${meetingData.title} @ ${new Date(
    meetingData.date
  ).toDateString()} 
      ${meetingData.fromTime}
    -  ${meetingData.toTime}
   (${meetingData.createdByDetail.email})`;
};

const editMeetingSubject = (meetingData) => {
  return `Meeting Updated : ${meetingData.title} @ ${new Date(
    meetingData.date
  ).toDateString()} 
      ${meetingData.fromTime}
    -  ${meetingData.toTime}
   (${meetingData.createdByDetail.email})`;
};

const reScheduleMeetingSubject = (meetingData) => {
  return `Meeting Rescheduled : (Meeting Title: ${meetingData.title
    }, Rescheduled On: ${new Date(meetingData.date).toDateString()} 
     ${meetingData.fromTime}
    -  ${meetingData.toTime})`;
};

const createMinuteSubject = (meetingData) => {
  return `MOM Created: (Meeting Title: ${meetingData.title
    }, Held On: ${new Date(meetingData.date).toDateString()} 
     ${meetingData.fromTime}
    -  ${meetingData.toTime})`;
};

const reassignRequestSubject = (meetingData) => {
  return `Action Forward Request : ${meetingData.title} (${meetingData?.createdByDetail?.email})`;
};

const reassignSubject = (action) => {
  return `Action Forwarded: (Action: ${action.title})`;
};

const reassignAcceptedSubject = (action) => {
  return `Action Forward Request Accepted: (Action: ${action.title})`;
};

const assignSubject = (action) => {
  return `Action Assigned: (Action: ${action.title})`;
};
const reOpenSubject = (action) => {
  return `Action Reopened: (Action: ${action.title})`;
};

const actionApproveSubject = (action) => {
  return `Action Approved: (Action: ${action.title})`;
};

const sendAmendmentCreatedSubject = (meetingData) => {
  return ` Minutes Updates: ${meetingData.title} (${meetingData?.createdByDetail?.email})`;
};

const acceptMinuteSubject = (meetingData) => {
  return ` Minutes Accepted: ${meetingData.title} (${meetingData?.createdByDetail?.email})`;
};

const cancelActionSubject = (action) => {
  return ` Action Cancelled: (Action: ${action.title})`;
};

const sendReminders = (meetingData) => {
  return `Upcoming Meeting: (Meeting Title: ${meetingData.title
    }, Scheduled On:  ${new Date(meetingData.date).toDateString()} 
     ${meetingData.fromTime}
    -  ${meetingData.toTime})`;
};

const rejectReassignRequestSubject = (action) => {
  return ` Action Forward Request Rejected: (Action: ${action.title})`;
};
const actionCompleteSubject = (action) => {
  return ` Action Completed: (Action: ${action.title})`;
};

const sendGiveWriteMOMPermissionEmailSubject = (meetingData) => {
  return ` MOM Write Permission Added: (Meeting Title: ${meetingData.title})`;
};

const createEmployeeSubject = (adminDetails) => {
  return `Account Created: MinutesVault (Organization Name: ${adminDetails?.organizationDetail?.name})`;
};

const actionDueReminderSubject = (action) => {
  return `Action Pending: (Action: ${action.title})`;
};

module.exports = {
  sendGiveWriteMOMPermissionEmailSubject,
  actionCompleteSubject,
  sendAmendmentCreatedSubject,
  rejectReassignRequestSubject,
  actionApproveSubject,
  reOpenSubject,
  reScheduleMeetingSubject,
  editMeetingSubject,
  signInOtpsubject,
  updateMeetingSubject,
  createMeetingSubject,
  cancelMeetingSubject,
  scheduleMeetingSubject,
  createMinuteSubject,
  reassignRequestSubject,
  reassignSubject,
  acceptMinuteSubject,
  cancelActionSubject,
  sendReminders,
  createEmployeeSubject,
  actionDueReminderSubject,
  sendAttendanceDetailsSubject,
  demoServeySubject,
  contactUsSubject,
  requestDemoOtpSubject,
  contactUsMessage,
  requestDemoOtpMessage,
  contactUsOtpSubject,
  organizationRegistrationOtpSubject,
  assignSubject,
  reassignAcceptedSubject
};
