const mongoose = require("mongoose");
const actionCommentsSchema = new mongoose.Schema(
  {
    userId: {
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
      {
        type: mongoose.Schema.ObjectId,
        
      },
    ],
  },
  {
    timestamps: true,
  }
);
const ActionComments = mongoose.model("actionComments", actionCommentsSchema);
module.exports = ActionComments;
