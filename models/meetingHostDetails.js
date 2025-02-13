// hostedBy: "zoom",
// meetingId: meeting._id,
// hostMeetingId: meetingHostData.id,
// duration: meetingHostData.duration,
// dateTime: meetingHostData.start_time,
// attendees: attendeesEmailids,

const mongoose = require("mongoose");
const hostSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    hostMeetingId: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: false,
    },
    meetingDateTime: {
      type: Date,
      required: true,
    },
    meetingLink: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
    },

    attendees: [
      {
        type: String,
      },
    ],
    hostedBy: {
      type: String,
      enum: ["zoom","gmeet"],
      default: "zoom",
    },
  },
  {
    timestamps: true,
  }
);
const meetingHostDetails = mongoose.model("meetingHostDetails", hostSchema);
module.exports = meetingHostDetails;
