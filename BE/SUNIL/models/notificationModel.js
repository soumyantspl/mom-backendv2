const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    byUserId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.ObjectId,
    },
    organizationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    meetingId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    typeId: {
      type: mongoose.Schema.ObjectId,
      required: false,
    },
    details: {
      toDetails: {
        type: String,
      },
      byDetails: {
        type: String,
      },
    },
    isRead: {
      type: Boolean,
      require: true,
      default: false,
    },
    isImportant: {
      type: Boolean,
      require: true,
      default: false,
    },
    isActive: {
      type: Boolean,
      require: true,
      default: true,
    },
    isDelete: {
      type: Boolean,
      required: true,
      default: false,
    },
    allowedUsers: [
      {
        type: mongoose.Schema.ObjectId,
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["MEETING", "ACTION", "MINUTE","NA"],
      default: "NA",
    },
  },
  {
    timestamps: true,
  }
);
const Notification = mongoose.model("notification", notificationSchema);
module.exports = Notification;
