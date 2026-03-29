const mongoose = require("mongoose");

const classTimeScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ClassTimeSchedule", classTimeScheduleSchema);
