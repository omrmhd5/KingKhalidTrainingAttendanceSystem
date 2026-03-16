const mongoose = require("mongoose");

const traineeSchema = new mongoose.Schema(
  {
    civil_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    military_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    rank_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rank",
      required: true,
    },
    specialty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
      required: true,
    },
    shift_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    hasViolation: {
      type: Boolean,
      default: false,
    },
    violations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Violation",
      },
    ],
    hasDisciplinary: {
      type: Boolean,
      default: false,
    },
    disciplinary: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Disciplinary",
      },
    ],
  },
  { timestamps: true },
);

// Indexes for performance optimization
traineeSchema.index({ military_id: 1 });
traineeSchema.index({ civil_id: 1 });
traineeSchema.index({ shift_id: 1 });

module.exports = mongoose.model("Trainee", traineeSchema);
