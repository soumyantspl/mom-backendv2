const mongoose = require("mongoose");
const logsSchema = new mongoose.Schema(
  {
    moduleName: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    subDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const Logs = mongoose.model("logs", logsSchema);
module.exports = Logs;
