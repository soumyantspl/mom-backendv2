const mongoose = require("mongoose");
const validator = require("validator");
const organizationOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      validate: {
        validator: validator.isEmail,
        message: "{VALUE} is not a valid email",
      },
      index: true,
    },
    otp: {
      type: Number,
      required: true,
      index: true,
    },
    expiryTime: {
      type: Date,
      required: false,
    },
    otpResendTime: {
      type: Date,
      default: null,
    },
    otpCount: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
const organizationOtpLogs = mongoose.model("organizationOtpLogs", organizationOtpSchema);
module.exports = organizationOtpLogs;
