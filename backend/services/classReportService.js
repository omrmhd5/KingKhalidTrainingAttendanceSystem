const ClassReport = require("../models/ClassReport");
const User = require("../models/User");
const Class = require("../models/Class");
const ClassTimeSchedule = require("../models/ClassTimeSchedule");
const Trainee = require("../models/Trainee");

class ClassReportService {
  // Calculate stats based on student reports
  // Status Hierarchy:
  // - present = total students - (unique absent + unique escape) → includes those with violations only
  // - absence = count of unique students with absent status
  // - escapes = count of unique students with escape status
  // - violations = count of all violation entries (can coexist with absent/escape)
  async calculateStats(studentReports, classId) {
    const stats = {
      present: 0,
      absence: 0,
      escapes: 0,
      violations: 0,
    };

    // Track unique students with each status
    const studentsWithAbsence = new Set();
    const studentsWithEscape = new Set();

    studentReports.forEach((report) => {
      const studentId = report.studentId.toString();

      if (report.status === "absent") {
        studentsWithAbsence.add(studentId);
      }
      if (report.status === "escape") {
        studentsWithEscape.add(studentId);
      }
      if (report.status === "violation") {
        stats.violations++;
      }
    });

    // Calculate counts of unique students
    stats.absence = studentsWithAbsence.size;
    stats.escapes = studentsWithEscape.size;

    // Calculate present count: total students - (unique absent + unique escape)
    // Students with violations only are still counted as present
    const classItem = await Class.findById(classId);
    if (classItem) {
      stats.present =
        classItem.studentCount -
        studentsWithAbsence.size -
        studentsWithEscape.size;
    }

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

    // studentReports can be empty if all students are present
    if (studentReports === undefined) {
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

    // Validate all students exist (only if there are reported issues)
    if (studentReports && studentReports.length > 0) {
      // Get unique student IDs (same student can have multiple entries: absence + violation)
      const uniqueStudentIds = [
        ...new Set(studentReports.map((r) => r.studentId.toString())),
      ];
      const students = await Trainee.find({ _id: { $in: uniqueStudentIds } });
      if (students.length !== uniqueStudentIds.length) {
        throw new Error("بعض الطلاب غير موجودين");
      }
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
    newReport.stats = await this.calculateStats(studentReports, classId);

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
      // Get unique student IDs (same student can have multiple entries: absence + violation)
      const uniqueStudentIds = [
        ...new Set(studentReports.map((r) => r.studentId.toString())),
      ];
      const students = await Trainee.find({ _id: { $in: uniqueStudentIds } });
      if (students.length !== uniqueStudentIds.length) {
        throw new Error("بعض الطلاب غير موجودين");
      }
      report.studentReports = studentReports;
      // Recalculate stats when student reports change
      report.stats = await this.calculateStats(
        studentReports,
        classId || report.classId,
      );
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
