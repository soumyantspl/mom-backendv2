const { required } = require("joi");
const mongoose = require("mongoose");
const validator = require("validator");
const contactUsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
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
    phoneNo: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: false,
      index: true,
    },
    isDelete: {
      type: Boolean,
      required: true,
      default: false,
    },
    ip: { type: String, required: false },
    leadStatus: {
      status: {
        type: String,
        enum: ["pending","cancelled", "closed", "rejected", "forwarded"],
        default: "pending",
      },
      reason: { 
        type: String, 
        required: false 
      },
      forwardedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: false, 
      },
      forwardedUserName: {
        type: String,
        required: false, 
      },
      timeAndDate: {
        type: Date,
        required: true,
        default: Date.now(),
      },
    },
  },
  {
    timestamps: true,
  }
);
const ContactUs = mongoose.model("contactus", contactUsSchema);
module.exports = ContactUs;
