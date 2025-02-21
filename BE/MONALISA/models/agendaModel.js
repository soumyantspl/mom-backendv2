const mongoose = require("mongoose");
const agendaSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    meetingId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
    },
    timeLine: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
    isMOMGenerated: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Agenda = mongoose.model("agenda", agendaSchema);

module.exports = Agenda;
