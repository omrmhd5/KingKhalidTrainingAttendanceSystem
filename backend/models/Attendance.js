const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    trainee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainee",
      required: true,
    },
    military_id: {
      type: String,
      required: true,
      trim: true,
    },
    shift_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    entry_time: {
      type: Date,
    },
    exit_time: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["on-time", "late", "absent", "pending"],
      default: "pending",
    },
    duration_minutes: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure one entry per trainee per day
attendanceSchema.index({ military_id: 1, date: 1 }, { unique: false });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ shift_id: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
