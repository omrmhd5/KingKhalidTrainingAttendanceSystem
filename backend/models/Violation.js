const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema(
  {
    trainee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainee",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Violation", violationSchema);
