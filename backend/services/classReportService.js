const ClassReport = require("../models/ClassReport");
const User = require("../models/User");
const Class = require("../models/Class");
const ClassTimeSchedule = require("../models/ClassTimeSchedule");
const Trainee = require("../models/Trainee");

class ClassReportService {
  // Calculate stats based on student reports
  calculateStats(studentReports) {
    const stats = {
      present: 0,
      absence: 0,
      escapes: 0,
      violations: 0,
    };

    studentReports.forEach((report) => {
      if (report.status === "present") stats.present++;
      if (report.status === "absent") stats.absence++;
      if (report.status === "escape") stats.escapes++;
      if (report.violations && report.violations.length > 0) {
        stats.violations += report.violations.length;
      }
    });

    return stats;
  }

  async getAllClassReports(filters = {}) {
    const query = {};

    // Filter by teacher if provided
    if (filters.teacherId) {
      query.teacherId = filters.teacherId;
    }

    // Filter by class if provided
    if (filters.classId) {
      query.classId = filters.classId;
    }

    // Filter by date range if provided
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    return await ClassReport.find(query)
      .populate("teacherId", "username email")
      .populate("classId", "name")
      .populate("schedule", "name start_time end_time")
      .populate("studentReports.studentId", "full_name military_id civil_id")
      .sort({ date: -1 });
  }

  async getClassReportById(id) {
    const report = await ClassReport.findById(id)
      .populate("teacherId", "username email")
      .populate("classId", "name")
      .populate("schedule", "name start_time end_time")
      .populate("studentReports.studentId", "full_name military_id civil_id");

    if (!report) {
      throw new Error("التقرير غير موجود");
    }

    return report;
  }

  async createClassReport(data) {
    const { date, teacherId, classId, schedule, studentReports } = data;

    // Validation
    if (!date) {
      throw new Error("التاريخ مطلوب");
    }

    if (!teacherId) {
      throw new Error("معرف المعلم مطلوب");
    }

    if (!classId) {
      throw new Error("معرف الفصل مطلوب");
    }

    if (!schedule) {
      throw new Error("معرف الجدول الزمني مطلوب");
    }

    if (!studentReports || studentReports.length === 0) {
      throw new Error("تقارير الطلاب مطلوبة");
    }

    // Validate teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      throw new Error("المعلم غير موجود");
    }

    // Validate class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      throw new Error("الفصل غير موجود");
    }

    // Validate schedule exists
    const scheduleItem = await ClassTimeSchedule.findById(schedule);
    if (!scheduleItem) {
      throw new Error("الجدول الزمني غير موجود");
    }

    // Validate all students exist
    const studentIds = studentReports.map((r) => r.studentId);
    const students = await Trainee.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      throw new Error("بعض الطلاب غير موجودين");
    }

    // Create report
    const newReport = new ClassReport({
      date: new Date(date),
      teacherId,
      classId,
      schedule,
      studentReports,
      submittedAt: new Date(),
    });

    // Calculate stats automatically
    newReport.stats = this.calculateStats(studentReports);

    await newReport.save();

    // Re-query to get populated data
    return await ClassReport.findById(newReport._id)
      .populate("teacherId", "username email")
      .populate("classId", "name")
      .populate("schedule", "name start_time end_time")
      .populate("studentReports.studentId", "full_name military_id civil_id");
  }

  async updateClassReport(id, data) {
    const { date, teacherId, classId, schedule, studentReports } = data;

    const report = await ClassReport.findById(id);
    if (!report) {
      throw new Error("التقرير غير موجود");
    }

    // Validate if updating teacherId
    if (teacherId && teacherId !== report.teacherId.toString()) {
      const teacher = await User.findById(teacherId);
      if (!teacher) {
        throw new Error("المعلم غير موجود");
      }
      report.teacherId = teacherId;
    }

    // Validate if updating classId
    if (classId && classId !== report.classId.toString()) {
      const classItem = await Class.findById(classId);
      if (!classItem) {
        throw new Error("الفصل غير موجود");
      }
      report.classId = classId;
    }

    // Validate if updating schedule
    if (schedule && schedule !== report.schedule.toString()) {
      const scheduleItem = await ClassTimeSchedule.findById(schedule);
      if (!scheduleItem) {
        throw new Error("الجدول الزمني غير موجود");
      }
      report.schedule = schedule;
    }

    // Update student reports if provided
    if (studentReports) {
      const studentIds = studentReports.map((r) => r.studentId);
      const students = await Trainee.find({ _id: { $in: studentIds } });
      if (students.length !== studentIds.length) {
        throw new Error("بعض الطلاب غير موجودين");
      }
      report.studentReports = studentReports;
      // Recalculate stats when student reports change
      report.stats = this.calculateStats(studentReports);
    }

    // Update date if provided
    if (date) {
      report.date = new Date(date);
    }

    await report.save();

    // Re-query to get populated data
    return await ClassReport.findById(report._id)
      .populate("teacherId", "username email")
      .populate("classId", "name")
      .populate("schedule", "name start_time end_time")
      .populate("studentReports.studentId", "full_name military_id civil_id");
  }

  async deleteClassReport(id) {
    const report = await ClassReport.findById(id);

    if (!report) {
      throw new Error("التقرير غير موجود");
    }

    await ClassReport.findByIdAndDelete(id);

    return {
      message: "تم حذف التقرير بنجاح",
      deletedId: id,
    };
  }
}

module.exports = new ClassReportService();
