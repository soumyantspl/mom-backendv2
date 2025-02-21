const mongoose = require("mongoose");
const actionCommentsSchema = new mongoose.Schema(
  {
    commentDescription: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    actionId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const ActionComments = mongoose.model("actionComments", actionCommentsSchema);
module.exports = ActionComments;
