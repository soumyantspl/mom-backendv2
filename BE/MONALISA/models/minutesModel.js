const mongoose = require("mongoose");
const minutesSchema = new mongoose.Schema(
  {
    parentMinuteId: {
      type: mongoose.Schema.ObjectId,
      required: false,
    },
    minuteId: {
      type: mongoose.Schema.ObjectId,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdById: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    priority: {
      type: String,
      enum: ["HIGH", "NORMAL", "LOW"],
      required: true,
    },
    attendees: [
      {
        id: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        status: {
          type: String,
          enum: ["ACCEPTED", "REJECTED", "PENDING"],
          required: true,
        },
        updatedAt: {
          type: Date,
          required: true,
          default: Date.now(),
        },
      },
    ],
    amendmentDetails: [
      {
        createdById: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        details: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["ACCEPTED", "REJECTED", "PENDING"],
          required: true,
        },
      },
    ],
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
    reassignedUserId: {
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
        actionDateTime: {
          type: Date,
        },
        rejectDetails: {
          type: String,
        },
        reAssignReason: {
          type: String,
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
          required: true,
        },
        priority: {
          type: String,
          enum: ["HIGH", "NORMAL", "LOW"],
          default: "LOW",
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
    isAction: {
      type: Boolean,
      required: true,
      default: false,
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
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "PENDING"],
      required: true,
      default: "DRAFT",
    },
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
    sequence: {
      type: Number,
      required: true,
    },
    mainDueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Minutes = mongoose.model("Minutes", minutesSchema);

module.exports = Minutes;
