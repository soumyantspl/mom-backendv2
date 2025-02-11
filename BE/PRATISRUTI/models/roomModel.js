const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: null,
    },
    organizationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    isActive: {
      type: Boolean,
      require: true,
      default: true,
    },
    unitId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    isDelete: {
      type: Boolean,
      required: true,
      default: false,
    },
    unitId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Rooms = mongoose.model("meetingrooms", roomSchema);
module.exports = Rooms;
