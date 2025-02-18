const createdSuccess = "Created successfully!";
const dempoCreateSuccess =
  "Thank you for requesting a demo! Our team will reach out to you shortly to schedule the demo at a convenient time!";
const createError = "Error while creating!";
const updateSuccess = "Updated successfully!";
const meetingUpdateSuccess =
  "Meeting is updated and notification sent to all the attendees successfully.";
const updateFailedRecordNotFound = "Record not found. Update failed!";
const deleteSuccess = "Deleted successfully!";
const writeMinuteNotAllowed =
  "Sorry, Write minute is not allowed for closed meeting.";
const deleteFailedRecordNotFound = "Record not found. Delete failed!";
const deleteFailedNotAllowed =
  "Sorry, MOM Generated Minute delete is not allowed.";
const recordsNotFound = "No records found!";
const recordNotFound = "No record found!";
const recordsFound = "Records found!";
const active = "Employe is activated!";
const deActive = "Employe is deactivated!";
const unitActive = "Unit is activated!";
const unitDeActive = "Unit is deactivated!";
const passwordReset = "Please reset password & try again.";
const resendMeetingDetails =
  "The meeting details have been resent successfully .";
const allNotification = "All  notifications Filtered!";
const markAsRead = "All Read notifications Filtered!";
const markAsUnRead = "All Unread notifications Filtered!";
const markAsImportant = "All Important notifications Filtered!";
const isDeleteNotAllowed = "Agenda delete not allowed!";
const duplicateEntry = "Duplicate entry found!";
const duplicateEmpCode = "Duplicate employee id found!";
const duplicateEmail = "This Email is already exist!!";
const expiredOtp =
  "The OTP you entered has been expired. Please use resend otp!";
const roomUnavailable = "The room is already booked for the selected date and time range.";
const invaliToken = "Invalid token";
const invalidUser =
  "Your account is not currently active. Please contact your adminstrator.";
//---------------------------------------------------------------------------------------//
const organizationCreated = "Organization registered successfully";
const duplicateOrganizationFound = "This Email is already exist!!";
const duplicateDepartment = "This department allready exist";
const departmentCreated = "Department has been created";
const idIsNotAvailabled = "Given id is Not availabled";
const organizationUpdated = "Organization data updated";
const organizationEmailUpdated = "Organization Email is updated";
const departmentUpdated = "Department data updated";
const departmentDeleted = "Department has been Deleted";
const departmentList = "Department list fetched";
const designationCreated = "Designation has been created";
const designationUpdated = "Designation has been updated";
const designationDeleted = "Designation has been deleted";
const designationList = "Fetched all designations";
const cancelFailed = "Cancel Failed";
const canceled = "Cancelled Successfully";
const invalidId = "Invalid Id!";
const duplicateName = "This Name is already exist!!";
const signInSuccess = "You have successfully signed in!";
const incorrectPassword =
  "The password you entered is incorrect. Please verify and try again.";
const passwordResetSuccess = "Your password has been successfully reset!";
const otpVerifiedSuccess = "Your OTP has been successfully verified!";
const invalidOtp =
  "The OTP you entered is incorrect. Please verify and try again.";
const userNotFound =
  "The email you entered does not match our records. Please enter a valid  email.";
const otpSentSuccess = async (email) => {
  return `A 6 digit OTP has been sent to ${email}.`;
};
const otpResendMessage = async (attemptNumbar, email) => {
  return `You have requested to resend the OTP ${attemptNumbar} out of ${process.env.OTP_MAX_RESENDCOUNT} times. An OTP has been sent to your registered email address at ${email}. Please check your email and enter the OTP here.`;
};
const otpResendMaxLimitCrossed = `Sorry! You have reached the maximum limit of 3 OTP resend attempts. Please try again after ${process.env.OTP_MAX_RESEND_TIMEINMINUTES} minutes.`;
const momGeneratedSuccessfully =
  "MOM generated succeffully & notification sent to all attendees.";
const pleaseAddAttendance = "Please add attendance.";
const configCreatedSuccess = "Configuration Created successfully!";
const configUpdateSuccess = "Configuration Updated successfully!";
const alertCreatedSuccess = "Alert Created successfully!";
const alertUpdateSuccess = "Alert Updated successfully!";
const rescheduledSuccess = "Meeting rescheduled successfully.";
const accessDenied = "Access denied!";
const momWritePermissionDenied = "MOM write permission access denied!";
const approveSuccess = "Action has been approved.";
const reopenSuccess = "Action has been reopened.";
const cancelSuccess = "Action has been cancelled.";
const rejectedSuccess = "Action has been rejected.";
const isRead = "Marked as read";
const isUnread = "Marked as unread";
const isImportant = "Marked as important";
const isDelete = "Deleted successfully";
const pleaseAddMinute = "Please add minute.";
const inActiveOrganization =
  "The Organization has been deactivated, please contact adminstration";
const isMaxOtpSendOvered = `You have sent maximum number of OTP, Please try after ${process.env.CHECK_OTP_VALIDATION_TIME} minutes`;
const isOtpVerified = `OTP is already verified, Please try after ${process.env.CHECK_OTP_VALIDATION_TIME} minutes`;
const otpNotVerified = "OTP is not verified please verify first";
const contactUsCreateSuccess =
  "Thank you for contacting to MinutesVault. Our team will reach out to you shortly.";
const otpExpired = "OTP is expired. Please resend OTP.";
const isOtpNotFound = "OTP is not generated. Please generate OTP first.";
const wrongOtpFound = "Wrong OTP. Please try again.";
const editMinuteNotAllowed = "Edit minutes not allowed for closed minutes.";
const deleteAgendaNotAllowed = "Delete agenda not allowed for closed meeting.";
const editAgendaNotAllowed = "Edit agenda not allowed for closed meeting.";
const meetingEditDenied = "Meeting can not be edited as already minute created."
const serverError = "Internal Server Error"
const updateAttendanceSuccess = " Attendance updated successfully";
const emailAlreadyUsed = "This Email is already in use by an Employee"
const importedSuccess = "File imported successfully"
const duplicateOrganizationCode = "The Organization Code is already exist, Please try another one!";
const wrongZoomCredentials = "Please add correct credentials!";
const recordingsDownloadedSuccessfully = "All recordings downloaded successfully."
const importSuccess = "Import completed successfully."
const importFailed = "Import completed with errors.Please check Reason for Failed column"
const importEroor = "Error in processing Excel file"
const validationError = "Validation Errors"
const attendeeUnavailable = "This attendee is already scheduled for a meeting at the same date and time "
const organizerUnavailable = "You already have a meeting scheduled on this date from "

///Pratishruti//
//view pRofile//
const currentPasswordIncorrect ="Current Password is Incorrect"
const MOMDownloadedSuccessfully="MOM downloaded successfully."
const notificationSent = "Email sent successfully"
const notValid = "Draft Meeting Cleanup Days must be at least 2 days greater than Draft MeetingReminder Days"
const draftDeleted ="Draft Meeting Deleted"
const deleteDraftFailed ="Faild in Delete Draft Meeting"
module.exports = {
  pleaseAddMinute,
  isDeleteNotAllowed,
  cancelSuccess,
  approveSuccess,
  reopenSuccess,
  momWritePermissionDenied,
  accessDenied,
  pleaseAddAttendance,
  momGeneratedSuccessfully,
  rescheduledSuccess,
  otpResendMessage,
  duplicateName,
  otpSentSuccess,
  userNotFound,
  invalidOtp,
  expiredOtp,
  otpVerifiedSuccess,
  invaliToken,
  invalidUser,
  otpResendMaxLimitCrossed,
  //----------------------------//
  recordNotFound,
  createError,
  organizationCreated,
  duplicateOrganizationFound,
  duplicateDepartment,
  departmentCreated,
  idIsNotAvailabled,
  organizationUpdated,
  departmentUpdated,
  departmentDeleted,
  departmentList,
  designationCreated,
  designationUpdated,
  designationDeleted,
  designationList,
  duplicateEntry,
  createdSuccess,
  invalidId,
  updateSuccess,
  passwordResetSuccess,
  signInSuccess,
  incorrectPassword,
  recordsNotFound,
  recordsFound,
  deleteSuccess,
  updateFailedRecordNotFound,
  deleteFailedRecordNotFound,
  duplicateEmpCode,
  duplicateEmail,
  canceled,
  cancelFailed,
  configCreatedSuccess,
  configUpdateSuccess,
  isRead,
  isUnread,
  isImportant,
  isDelete,
  alertCreatedSuccess,
  alertUpdateSuccess,
  markAsRead,
  markAsUnRead,
  markAsImportant,
  allNotification,
  active,
  deActive,
  passwordReset,
  meetingUpdateSuccess,
  resendMeetingDetails,
  deleteFailedNotAllowed,
  writeMinuteNotAllowed,
  inActiveOrganization,
  unitDeActive,
  unitActive,
  dempoCreateSuccess,
  isMaxOtpSendOvered,
  isOtpVerified,
  otpNotVerified,
  contactUsCreateSuccess,
  otpExpired,
  isOtpNotFound,
  wrongOtpFound,
  editMinuteNotAllowed,
  editAgendaNotAllowed,
  deleteAgendaNotAllowed,
  meetingEditDenied,
  serverError,
  updateAttendanceSuccess,
  emailAlreadyUsed,
  organizationEmailUpdated,
  importedSuccess,
  duplicateOrganizationCode,
  wrongZoomCredentials,
  rejectedSuccess,
  MOMDownloadedSuccessfully,
  recordingsDownloadedSuccessfully,
  importSuccess,
  importFailed,
  importEroor,
  validationError,
  currentPasswordIncorrect,
  attendeeUnavailable,
  roomUnavailable,
  organizerUnavailable,
  notificationSent,
  notValid,
  deleteDraftFailed,
  draftDeleted
};
