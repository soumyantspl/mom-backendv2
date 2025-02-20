const mongoose = require("mongoose");
const validator = require("validator");

const otpDemoSchema = new mongoose.Schema(
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
    otpResendCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


const otpDemo = mongoose.model("OtpDemo", otpDemoSchema);

module.exports = otpDemo;
