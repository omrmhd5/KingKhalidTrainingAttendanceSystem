const mongoose = require("mongoose");

const disciplinarySchema = new mongoose.Schema(
  {
    trainee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainee",
      required: true,
    },
    reason: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Disciplinary", disciplinarySchema);
