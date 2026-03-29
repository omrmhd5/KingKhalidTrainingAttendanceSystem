const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم الفصل مطلوب"],
      trim: true,
      unique: true,
    },
    assignedTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainee",
      },
    ],
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassTimeSchedule",
      required: [true, "الجدول الزمني مطلوب"],
    },
  },
  {
    timestamps: true,
  },
);

// Virtual for student count
ClassSchema.virtual("studentCount").get(function () {
  return this.students ? this.students.length : 0;
});

// Include virtuals when converting to JSON
ClassSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Class", ClassSchema);
