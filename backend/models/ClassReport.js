const mongoose = require("mongoose");

const ClassReportSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "التاريخ مطلوب"],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "معرف المعلم مطلوب"],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "معرف الفصل مطلوب"],
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassTimeSchedule",
      required: [true, "معرف الجدول الزمني مطلوب"],
    },
    presentReports: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Trainee",
          required: true,
        },
      },
    ],
    absenceReports: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Trainee",
          required: true,
        },
      },
    ],
    escapeReports: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Trainee",
          required: true,
        },
      },
    ],
    courseReports: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Trainee",
          required: true,
        },
      },
    ],
    violationReports: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Trainee",
          required: true,
        },
        violationType: {
          type: Number,
          enum: [1, 2, 3, 4],
          required: true,
        },
        violationDescription: {
          type: String,
          default: null,
        },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    stats: {
      present: {
        type: Number,
        default: 0,
      },
      absence: {
        type: Number,
        default: 0,
      },
      escapes: {
        type: Number,
        default: 0,
      },
      course: {
        type: Number,
        default: 0,
      },
      violations: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
ClassReportSchema.index({ teacherId: 1, classId: 1, date: 1 });
ClassReportSchema.index({ classId: 1, date: 1 });

module.exports = mongoose.model("ClassReport", ClassReportSchema);
