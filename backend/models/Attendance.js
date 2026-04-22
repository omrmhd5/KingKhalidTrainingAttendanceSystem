const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    trainee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainee",
      required: true,
    },
    civil_id: {
      type: String,
      required: true,
      trim: true,
    },
    military_id: {
      type: String,
      required: true,
      trim: true,
    },
    trainee_assigned_shift_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
      description: "الشفت المخصص للمتدرب (الشفت الأصلي)",
    },
    shift_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
      description: "الشفت الذي حضر به المتدرب فعلياً",
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

// Indexes for performance optimization
// Compound index for duplicate entry prevention and civil_id + date queries
attendanceSchema.index({ civil_id: 1, date: 1 }, { unique: false });
// Compound index for duplicate entry prevention and military_id + date queries
attendanceSchema.index({ military_id: 1, date: 1 }, { unique: false });
// Compound index for escape/exit queries (also serves date-only queries)
attendanceSchema.index({ date: 1, entry_time: 1, exit_time: 1 });
// Simple indexes for shift filtering and trainee lookups
attendanceSchema.index({ shift_id: 1 });
attendanceSchema.index({ trainee_assigned_shift_id: 1 });
attendanceSchema.index({ trainee_id: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
