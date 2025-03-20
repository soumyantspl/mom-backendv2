const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    planType: {
      type: String,
     // enum: ["free", "basic", "premium"],
      required: true,
    },
    participantLimit: {
      type: Number,
      required: true,
    },
    meetingCount: {
      type: Number,
      required: true,
    },
    meetingDuration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "3year"],
      required: true,
    },
    validity: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);
module.exports = SubscriptionModel;
