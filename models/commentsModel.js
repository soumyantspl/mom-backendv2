const mongoose = require("mongoose");
const actionCommentsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    meetingId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    actionId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    commentDescription: {
      type: String,
      required: true,
    },
    mentionedUsers: [
      new mongoose.Schema(
        {
          id: { type: mongoose.Schema.ObjectId },
          name: { type: String },
        },
        { _id: false } 
      ),
    ],
  },
  {
    timestamps: true,
  }
);
const ActionComments = mongoose.model("actionComments", actionCommentsSchema);
module.exports = ActionComments;
