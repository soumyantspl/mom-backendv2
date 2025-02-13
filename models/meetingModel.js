const mongoose = require("mongoose");
const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    meetingId: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["VIRTUAL", "PHYSICAL"],
      default: "PHYSICAL",
    },
    locationDetails: {
      location: {
        type: String,
      },
      isMeetingRoom: {
        type: Boolean,
        required: true,
      },
      roomId: {
        type: mongoose.Schema.ObjectId,
      },
    },
    link: {
      type: String,
    },
    hostDetails: {
      hostLink: {
        type: String,
      },
      hostingPassword: {
        type: String,
      },
      hostType: {
        type: String,
        enum: ["MANUAL", "ZOOM","GMEET"],
        default: "zoom",
      },
    },
    // hostLink: {
    //   type: String,
    // },
    date: {
      type: Date,
      required: true,
    },
    fromTime: {
      type: String,
    },
    toTime: {
      type: String,
    },

    updatedFromTime: {
      type: String,
    },
    updatedToTime: {
      type: String,
    },
    step: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    followOnSerialNo: {
      type: Number,
      default: 0,
    },
    attendees: [
      {
        _id: {
          type: mongoose.Schema.ObjectId,
          required: [true, "id is required"],
        },
        rsvp: {
          type: String,
          enum: ["YES", "NO", "AWAITING", "MAYBE"],
          default: "AWAITING",
        },
        isAttended: {
          type: Boolean,
          required: true,
          default: false,
        },
        canWriteMOM: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
    meetingStatus: {
      status: {
        type: String,
        enum: ["closed", "scheduled", "rescheduled", "cancelled", "draft"],
        default: "draft",
      },
      remarks: { type: String, required: false },
      timeAndDate: {
        type: Date,
        required: true,
        default: Date.now(),
      },
    },
    organizationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    createdById: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },

    agendaIds: [
      {
        type: mongoose.Schema.ObjectId,
      },
    ],
    isAttendanceAdded: {
      type: Boolean,
      required: true,
      default: false,
    },
    isMinutesAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    isClosed: {
      type: Boolean,
      required: true,
      default: false,
    },
    momGenerationDetails: [
      {
        createdById: {
          type: mongoose.Schema.ObjectId,
          required: [true, "id is required"],
        },
        createdAt: {
          type: Date,
          required: true,
          default: Date.now(),
        },
        status: {
          type: Boolean,
          required: true,
          default: false,
        },
        filePath: {
          type: String,
        },
        momId: {
          type: String,
          required: false,
        },
      },
    ],
    meetingCloseDetails: {
      closedById: {
        type: mongoose.Schema.ObjectId,
      },
      closedAt: {
        type: Date,
        required: true,
        default: Date.now(),
      },
    },
    parentMeetingId: {
      type: mongoose.Schema.ObjectId,
      required: false,
    },
    isMOMAutoAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    linkType: {
      type: String,
      enum: ["MANUAL", "ZOOM","GMEET"],
      default: "MANUAL",
    },
    isRescheduled: {
      type: Boolean,
      required: true,
      default: false,
    },
    rescheduledForMeetingId: {
      type: mongoose.Schema.ObjectId,
      required: false,
    },
    rescheduledParentMeetingId: {
      type: mongoose.Schema.ObjectId,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
const Meetings = mongoose.model("meetings", meetingSchema);
module.exports = Meetings;
