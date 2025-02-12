const Meeting = {
  moduleName: "Meeting",
  createMeeting: "Meeting Created",
  createMeetingDetails: "A new meeting created",
  updateMeeting: "Meeting Updated",
  updateMeetingDetails: "The meeting has been updated",
  updateAttendees: "Attendees UPDATED",
  updateRSVP: "Attendees confirmation changed ",
  cancelMeeting: "Meeting cancelled",
  reScheduleMeeting: "Meeting Rescheduled",
  updateMeetingAttendance: "Meeting Attendance Updated",
  momCreated: "Mom Created",
  updateMOMWrite: "MOM Write Permission Updated",
  createFollowOnMeeting: "Follow on meeting created",
  momDownloaded: "MOM Downloaded",
};

const Department = {
  moduleName: "Department",
  createDepartment: "Department Created",
  createDepartmentDetails: "A new Department created, Named as ",
  updateDepartmentDetails: "The Department has been updated",
  editDepartment: "Department updated",
  editDepartmentDetails: "Department has been edited",
  deleteDepartment: "Department deleted",
  deleteDetails: "Deleted Department:",
};

const Designation = {
  moduleName: "Designation",
  createDesignation: "Designation Created",
  createDesignationDetails: "A new Designation created ,named as ",
  updateDesignation: "Designation is Updated",
  updateDesignationDetails: "The Designation has been updated",
  editDesignation: "Designation updated",
  deleteDesignation: "Designation Deleted",
  deleteDesignationDetails: "Deleted is Designation:"
};

const Minute = {
  moduleName: "Minute",
  createMinute: "New Minute Created",
  updateMinute: "Minute Updated",
  deleteMinute: "Minute Deleted",
  acceptMinute: "MOM Accepted",
};
const Action = {
  moduleName: "Action",
  createComment: "Commented",
  updateAction: "Action Updated",
  createDesignationDetails: "A new Designation created",
  updateDesignation: "Designation Updated",
  updateDesignationDetails: "The Designation has been updated",
  editDesignation: "Designation has been edited",
  deleteDesignation: "Designation has been deleted",
  details: "Designation deleted succesfully",
  reassignAction: "Action Forward",
  actionReassignRequested: "Action forward Requested",
  completeAction: "Action Completed",
  actionReassignRequestRejected: "Action forward request rejected",
  reopenAction: "Action reopened",
  cancelAction: "Action cancelled",
  approveAction: "Action approved",
};

const Agenda = {
  moduleName: "Agenda",
  createAgenda: "Agenda Created",
  updateAgenda: "Agenda Updated",
  updateDesignationDetails: "The Designation has been updated",
  editDesignation: "Designation has been edited",
  deleteAgenda: "Agenda has been deleted",
};

const Employee = {
  moduleName: "Employee",
  createEmployee: "Employee Created",
  updateEmployee: "Employee Updated",
  updateEmployeeDetails: "The Employee has been updated",
  editEmployee: "Employee edited",
  employeeStatus: " Status changed",
  deleteEmployee: " Employee deleted",
  deleteEmployeeDetails: " has been deleted",
};

const Room = {
  moduleName: "Room",
  createRoom: "Room Created",
  updateRoom: "Room Updated",
  updateRoomDetails: "The Room is updated",
  editRoom: "Room is Updated",
  deleteRoom: "Room is deleted",
  deleteRoomDetails: "Deleted Room:",
};

const Unit = {
  moduleName: "Unit",
  createUnit: "Unit Created",
  createUnitDetails: "Unit Created of ",
  updateUnit: "Unit is Updated",
  updateUnitDetails: "Unit has been updated",
  editUnit: "Unit has been Updated",
  deleteUnit: "Unit Deleted",
  detailsdeleteUnit: "Deleted Unit:",
  unitStatus: "Status is changed",
};

const Roles = {
  moduleName: "Roles",
  createRole: "Unit Created",
  createRoleDetails: "Unit Created of ",
  updateRole: "Unit Updated",
  updateRoleDetails: "Unit has been updated",
  editRole: "Unit has been edited",
  deleteRole: "Unit has been deleted",
  detailsdeleteRole: " deleted succesfully",
};

const Organization = {
  moduleName: "Organization",
  createOrganization: "Organization Created",
  createOrganizationDetails: "Organization Created of ",
  updateOrganization: "Organization Updated",
  updateOrganizationDetails: "Organization has been updated",
  editOrganization: "Organization has been edited",
  deleteOrganization: "Organization has been deleted",
  detailsDeleteOrganization: " Organization succesfully",
  organizationCodeUpdate: "Organization Code"
};

const Config = {
  moduleName: "Configuration",
  createConfig: "Configuration Updated",
  updateConfig: "Configuration Updated",
  createConfigDetails: "Configuration has been updated",
};

const Alert = {
  moduleName: "Alert",
  createAlert: "Alert created",
  updateAlert: "Alert updated",
};

const authModule = {
  moduleName: "Sign In",
  setPassword: "Reset Password",
  forgotPassword:"Forgot Password",
  setPasswordDetails: "Password set successfully",
  sendOTP: "Sign In",
  sendOTPfailed: "Failed to Send OTP",
  reSendOTP: "OTP Resend",
  sendOTPDetails: "OTP send to ",
  verifiedOTP: "OTP verifed successfull",
  signInByOTP: "SignIn by OTP is successfull",
  signInByPassword: "SignIn by passsword is successfull",
};
module.exports = {
  Meeting,
  Department,
  Designation,
  Action,
  Agenda,
  Employee,
  Room,
  Unit,
  Roles,
  Organization,
  Minute,
  Config,
  Alert,
  authModule,
};
