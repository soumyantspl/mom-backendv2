const mongoose = require("mongoose");
const momAcceptStatusSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    momId: {
      type: String,
      required: false,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isAutoAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const momAcceptStatus = mongoose.model(
  "momAcceptStatus",
  momAcceptStatusSchema
);

module.exports = momAcceptStatus;
