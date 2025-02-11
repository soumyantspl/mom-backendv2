const mongoose = require("mongoose");
const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
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
    isDelete: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const Units = mongoose.model("Units", unitSchema);
module.exports = Units;
