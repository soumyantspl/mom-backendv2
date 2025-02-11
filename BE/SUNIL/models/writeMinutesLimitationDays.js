const mongoose = require("mongoose");
const WriteMinutesLimitationDaysSchema = new mongoose.Schema(
  {
    dayValue: {
      type: Number,
      required: true,
      default: 0,
    },
    dayText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const WriteMinutesLimitationDays = mongoose.model(
  "WriteMinutesLimitationDays",
  WriteMinutesLimitationDaysSchema
);
module.exports = WriteMinutesLimitationDays;
