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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Trainee", traineeSchema);
