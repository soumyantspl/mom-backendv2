const mongoose = require("mongoose");
const validator = require("validator");
const demoClientSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);
const DemoClient = mongoose.model("demoClient", demoClientSchema);
module.exports = DemoClient;
