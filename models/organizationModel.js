const mongoose = require("mongoose");
const validator = require("validator");
const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dashboardLogo: {
      type: String,
    },
    loginLogo: { type: String },
    email: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: "{VALUE} is not a valid email",
      },
      default: null,
      required: true,
      index: true,
    },
    contactPersonName: {
      type: String,
    },
    phoneNo: {
      type: Number,
    },
    contactPersonPhNo: {
      type: Number
    },
    contactPersonWhatsAppNo: {
      type: Number
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    organizationCode: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model("organizations", organizationSchema);

module.exports = Organization;
