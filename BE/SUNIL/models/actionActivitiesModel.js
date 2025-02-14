const mongoose = require("mongoose");
const ActionActivitiesSchema = new mongoose.Schema({
  activityDetails: {
    type: String,
  },
  activityTitle: {
    type: String,
    required: true,
  },
  minuteId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  actionId: {
    type: mongoose.Schema.ObjectId,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  reassignedUserId: {
    type: mongoose.Schema.ObjectId,
  },
  createdAt: {
    type: Date,
    default: function () {
      return new Date();
    },
  },
  updatedAt: {
    type: Date,
    default: function () {
      return new Date();
    },
  },
  actionReassignedId: {
    type: mongoose.Schema.ObjectId,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  isRead:{
    type: Boolean,
    required: true,
    default: false,
  },
  status: {
    type: String,
    enum: [
      "PENDING",
      "REQUESTFORREASSIGN",
      "REASSIGNED",
      "COMPLETED",
      "REOPENED",
      "APPROVED",
      "CANCELLED",
    ],
    required: true,
    default: "PENDING",
  },
});
const ActionActivities = mongoose.model(
  "ActionActivities",
  ActionActivitiesSchema
);
module.exports = ActionActivities;
