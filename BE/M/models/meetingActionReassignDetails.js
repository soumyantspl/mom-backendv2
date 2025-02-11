const mongoose = require("mongoose");
const meetingActionReassignDetailsSchema = new mongoose.Schema(
  {
    actionId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    priority: {
      type: String,
      enum: ["HIGH", "NORMAL", "LOW"],
      required: true,
    },
    agendaId: {
      type: mongoose.Schema.ObjectId,
    },
    meetingId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    assignedUserId: {
      type: mongoose.Schema.ObjectId,
    },
    reassigneRequestDetails: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        dateTime: {
          type: Date,
          required: true,
          default: Date.now(),
        },
        requestDetails: {
          type: String,
        },
        isAccepted: {
          type: Boolean,
          default: false,
        },
        isRejected: {
          type: Boolean,
          default: false,
        },
        rejectDetails: {
          type: String,
        },
        reAssignReason: {
          type: String,
        },
        actionDateTime: {
          type: Date,
          required: true,
        },
      },
    ],
    reassignDetails: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        dateTime: {
          type: Date,
          required: true,
          default: Date.now(),
        },
        reAssignReason: {
          type: String,
        },
        oldDueDate: {
          type: Date,
        },
        newDueDate: {
          type: Date,
        },
        reAssignedUserId: {
          type: mongoose.Schema.ObjectId,
        },
        priority: {
          type: String,
          enum: ["HIGH", "NORMAL", "LOW"],
          required: true,
        },
      },
    ],
    isComplete: {
      type: Boolean,
      default: false,
    },
    isRequested: {
      type: Boolean,
      default: false,
    },
    isPending: {
      type: Boolean,
      default: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    isApproved: {
      type: Boolean,
      required: true,
      default: false,
    },
    isReopened: {
      type: Boolean,
      required: true,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      required: true,
      default: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    reopenDetails: [
      {
        remark: {
          type: String,
          required: true,
        },
        dateTime: {
          type: Date,
          required: true,
          default: Date.now(),
        },
        reOpenedById: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
      },
    ],
    isCancelDetails: {
      cancelById: {
        type: mongoose.Schema.ObjectId,
      },
      dateTime: {
        type: Date,
        required: true,
        default: Date.now(),
      },
    },
    isApprovedDetails: {
      approvedById: {
        type: mongoose.Schema.ObjectId,
      },
      remark: {
        type: String,
      },
      dateTime: {
        type: Date,
        required: true,
        default: Date.now(),
      },
    },
    isCompleteDetails: [
      {
        updatedById: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        dateTime: {
          type: Date,
          required: true,
          default: Date.now(),
        },
        isComplete: {
          type: Boolean,
          default: false,
        },
      },
    ],
    actionStatus: {
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
  },
  {
    timestamps: true,
  }
);
const MeetingActionReassignDetails = mongoose.model(
  "meetingActionReassignDetails",
  meetingActionReassignDetailsSchema
);
module.exports = MeetingActionReassignDetails;
