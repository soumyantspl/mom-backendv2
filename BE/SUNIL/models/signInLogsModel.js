const mongoose = require("mongoose");
const signInLogsSchema = new mongoose.Schema(
  {
    email: {
      type: mongoose.SchemaTypes.Email,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    isLoggedinSuccess: {
      type: Boolean,
      required: true,
    },
    isIpAddressBlocked: {
      type: Boolean,
      required: true,
    },
    looginAttempt: {
      type: Number,
      required: true,
    },
    looginAttemptTime: {
      type: Date,
      required: true,
    },
    organisationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const signInLogs = mongoose.model("signInLogs", signInLogsSchema);
module.exports = signInLogs;
