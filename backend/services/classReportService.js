const ClassReport = require("../models/ClassReport");
const User = require("../models/User");
const Class = require("../models/Class");
const ClassTimeSchedule = require("../models/ClassTimeSchedule");
const Trainee = require("../models/Trainee");

class ClassReportService {
  // Calculate stats based on student reports
  async calculateStats(
    presentReports,
    absenceReports,
    escapeReports,
    violationReports,
  ) {
    const stats = {
      present: presentReports ? presentReports.length : 0,
      absence: absenceReports ? absenceReports.length : 0,
      escapes: escapeReports ? escapeReports.length : 0,
      violations: violationReports ? violationReports.length : 0,
    };

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

    // Filter by schedule if provided
    if (filters.scheduleId) {
      query.schedule = filters.scheduleId;
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
      .populate("presentReports.studentId", "full_name military_id civil_id")
      .populate("absenceReports.studentId", "full_name military_id civil_id")
      .populate("escapeReports.studentId", "full_name military_id civil_id")
      .populate("violationReports.studentId", "full_name military_id civil_id")
      .sort({ date: -1 });
  }

  async getClassReportById(id) {
    const report = await ClassReport.findById(id)
      .populate("teacherId", "username email")
      .populate("classId", "name")
      .populate("schedule", "name start_time end_time")
      .populate("presentReports.studentId", "full_name military_id civil_id")
      .populate("absenceReports.studentId", "full_name military_id civil_id")
      .populate("escapeReports.studentId", "full_name military_id civil_id")
      .populate("violationReports.studentId", "full_name military_id civil_id");

    if (!report) {
      throw new Error("التقرير غير موجود");
    }

    return report;
  }

  async createClassReport(data) {
    const {
      date,
      teacherId,
      classId,
      schedule,
      presentReports,
      absenceReports,
      escapeReports,
      violationReports,
    } = data;

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

    // All report arrays must be provided (can be empty)
    if (
      presentReports === undefined ||
      absenceReports === undefined ||
      escapeReports === undefined ||
      violationReports === undefined
    ) {
      throw new Error("جميع تقارير الطلاب مطلوبة");
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

    // Collect all unique student IDs from all report types
    const allStudentIds = [
      ...presentReports.map((r) => r.studentId.toString()),
      ...absenceReports.map((r) => r.studentId.toString()),
      ...escapeReports.map((r) => r.studentId.toString()),
      ...violationReports.map((r) => r.studentId.toString()),
    ];

    const uniqueStudentIds = [...new Set(allStudentIds)];

    // Validate all students exist (only if there are any reports)
    if (uniqueStudentIds.length > 0) {
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
      presentReports,
      absenceReports,
      escapeReports,
      violationReports,
      submittedAt: new Date(),
    });

    // Calculate stats automatically
    newReport.stats = await this.calculateStats(
      presentReports,
      absenceReports,
      escapeReports,
      violationReports,
    );

    await newReport.save();

    // Re-query to get populated data
    return await ClassReport.findById(newReport._id)
      .populate("teacherId", "username email")
      .populate("classId", "name")
      .populate("schedule", "name start_time end_time")
      .populate("presentReports.studentId", "full_name military_id civil_id")
      .populate("absenceReports.studentId", "full_name military_id civil_id")
      .populate("escapeReports.studentId", "full_name military_id civil_id")
      .populate("violationReports.studentId", "full_name military_id civil_id");
  }

  async updateClassReport(id, data) {
    const {
      date,
      teacherId,
      classId,
      schedule,
      presentReports,
      absenceReports,
      escapeReports,
      violationReports,
    } = data;

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

    // Update student reports if any provided
    const hasReportUpdates =
      presentReports !== undefined ||
      absenceReports !== undefined ||
      escapeReports !== undefined ||
      violationReports !== undefined;

    if (hasReportUpdates) {
      const newPresentReports =
        presentReports !== undefined ? presentReports : report.presentReports;
      const newAbsenceReports =
        absenceReports !== undefined ? absenceReports : report.absenceReports;
      const newEscapeReports =
        escapeReports !== undefined ? escapeReports : report.escapeReports;
      const newViolationReports =
        violationReports !== undefined
          ? violationReports
          : report.violationReports;

      // Collect all unique student IDs from all report types
      const allStudentIds = [
        ...newPresentReports.map((r) => r.studentId.toString()),
        ...newAbsenceReports.map((r) => r.studentId.toString()),
        ...newEscapeReports.map((r) => r.studentId.toString()),
        ...newViolationReports.map((r) => r.studentId.toString()),
      ];

      const uniqueStudentIds = [...new Set(allStudentIds)];

      // Validate all students exist
      if (uniqueStudentIds.length > 0) {
        const students = await Trainee.find({ _id: { $in: uniqueStudentIds } });
        if (students.length !== uniqueStudentIds.length) {
          throw new Error("بعض الطلاب غير موجودين");
        }
      }

      report.presentReports = newPresentReports;
      report.absenceReports = newAbsenceReports;
      report.escapeReports = newEscapeReports;
      report.violationReports = newViolationReports;

      // Recalculate stats
      report.stats = await this.calculateStats(
        newPresentReports,
        newAbsenceReports,
        newEscapeReports,
        newViolationReports,
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
      .populate("presentReports.studentId", "full_name military_id civil_id")
      .populate("absenceReports.studentId", "full_name military_id civil_id")
      .populate("escapeReports.studentId", "full_name military_id civil_id")
      .populate("violationReports.studentId", "full_name military_id civil_id");
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
