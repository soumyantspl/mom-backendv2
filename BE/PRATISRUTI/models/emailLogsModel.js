const mongoose = require("mongoose");
const emailLogSchema = new mongoose.Schema(
  {
    emailType: {
      type: String,
      required: true,
    },
    emailFrom: {
      type: String,
      required: true,
    },
    emailTo: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAIL"],
      default: "SUCCESS",
    },
    attachments: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
const EmailLogs = mongoose.model("emailLogs", emailLogSchema);
module.exports = EmailLogs;
