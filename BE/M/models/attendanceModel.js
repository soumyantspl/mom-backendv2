const mongoose = require("mongoose");
const attendanceSchema = new mongoose.Schema(
  {
    fromTime: {
      type: String,
    },
    toTime: {
      type: String,
    },
    attendeeId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    createdById: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    meetingId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    attendanceType: {
      type: String,
      enum: ["FULL", "PARTIAL"],
      default: "FULL",
    },
    isAttended: {
      type: Boolean,
      required: true,
      index: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const Attendance = mongoose.model("attendances", attendanceSchema);
module.exports = Attendance;
