const mongoose = require('mongoose');
const validator = require("validator");

const bodySchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
  },
}, { _id: false });


const emailTemplateSchema = new mongoose.Schema({
  organizationId: {
    type: Number,
  },
  templateType: {
    type: String,
    enum: ["DEMOSENDOTP", "CONTACTUS", "LOGINSENDOTP","SAVECONTACTDETAILS",
            "SAVEDEMODETAILS", "ACTIONFORWARDED","ACTIONCOMPLETED", 
            "ACTIONREASSIGNREQUEST", "ACTIONCANCEL", "ACTIONASSIGN", 
            "ACTIONREASSIGNREQUESTREJECT", "ADDEMPLOYEE","ORGANIZATIONWELCOME",
             "ORGANIZATIONREGISTRATIONSENDOTP","GENERATEMOM", "ACTIONREOPEN","ACTIONAPPROVE",
             "RESCHEDULE", "RESENDSCHEDULEMEETING","SENDSCHEDULEMEETING" ,
            "GIVEWRITMOMPERMISSION", "ACCEPTMINUTES", "SENDATTENDANCEDETAILS",
             "ACTIONREASSIGNTOOLDUSER","MEETINGCANCEL", "ACTIONASSIGNADMIN"]
  },
  moduleName: {
    type: String,
    required: true,
  },
  templateName: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  // dear: {
  //   type: String,
  //   required: true,
  // },
  logo: {
    type: String,
  },
  parameter: {
    type: [String], 
  },
  demoSendOtpCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "DEMOSENDOTP";
    },
  },
  contactUsOtpCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "CONTACTUS";
    },
  },
  loginsendOtpCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "LOGINSENDOTP";
    },
  },
  savedemoCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "SAVEDEMODETAILS";
    },
  },
  saveContactCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "SAVECONTACTDETAILS";
    },
  },
  actionForwardedCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONFORWARDED";
    },
  },
  actionAssignCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONASSIGN";
    },
  },
  actionCompletedCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONCOMPLETED";
    },
  },
  actionReassignRequestCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONREASSIGNREQUEST";
    },
  },
  actionCancelCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONCANCEL";
    },
  },
  actionReassignRequestRejectCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONREASSIGNREQUESTREJECT";
    },
  },
  addEmployeeCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ADDEMPLOYEE";
    },
  },
   organizationWelcomCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ORGANIZATIONWELCOME";
    },
  },   
  organizationRegistrationSendOtpCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ORGANIZATIONREGISTRATIONSENDOTP";
    },
  },
  generateMomCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "GENERATEMOM";
    },
  },
  actionReOpenCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONREOPEN";
    },
  },
  actionApproveCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONAPPROVE";
    },
  },
  rescheduleCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "RESCHEDULE";
    },
  },
  reSendScheduledMeetingCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "RESENDSCHEDULEMEETING";
    },
  },
  sendScheduledMeetingCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "SENDSCHEDULEMEETING";
    },
  },
  giveWritemomPermissionCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "GIVEWRITMOMPERMISSION";
    },
  },
  acceptMinutesCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACCEPTMINUTES";
    },
  },
  sendAttendanceDetailsCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "SENDATTENDANCEDETAILS";
    },
  },
  actionAssignToOldAssignedUserCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONREASSIGNTOOLDUSER";
    },
  },
  meetingCancelCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "MEETINGCANCEL";
    },
  },
  actionAssignAdminCredentials: {
    type: bodySchema, 
    required: function () {
      return this.templateType === "ACTIONASSIGNADMIN";
    }
  },
  
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
