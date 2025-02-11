const mongoose = require("mongoose");
const validator = require("validator");
const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    empId: {
      type: String,
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
      unique: true,
    },
    designationId: {
      type: mongoose.Schema.ObjectId,
      default: null,
    },
    departmentId: {
      type: mongoose.Schema.ObjectId,
      default: null,
    },
    unitId: {
      type: mongoose.Schema.ObjectId,
      default: null,
    },
    organizationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      index: true,
      default: true,
    },
    isMeetingOrganiser: {
      type: Boolean,
      required: true,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      index: true,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    isEmployee: {
      type: Boolean,
      required: true,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDelete: {
      type: Boolean,
      required: true,
      default: false,
    },
    designation: {
      type: String,
      required: false,
    },
    companyName: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
const Employee = mongoose.model("employees", employeeSchema);
module.exports = Employee;
