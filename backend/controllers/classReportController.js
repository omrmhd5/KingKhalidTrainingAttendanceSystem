const classReportService = require("../services/classReportService");

class ClassReportController {
  async getAllClassReports(req, res) {
    try {
      const { teacherId, classId, scheduleId, startDate, endDate } = req.query;
      const filters = {};

      if (teacherId) filters.teacherId = teacherId;
      if (classId) filters.classId = classId;
      if (scheduleId) filters.scheduleId = scheduleId;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const reports = await classReportService.getAllClassReports(filters);
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({
        message: error.message || "فشل في تحميل التقارير",
      });
    }
  }

  async getClassReportById(req, res) {
    try {
      const report = await classReportService.getClassReportById(req.params.id);
      res.status(200).json(report);
    } catch (error) {
      res.status(404).json({
        message: error.message || "التقرير غير موجود",
      });
    }
  }

  async createClassReport(req, res) {
    try {
      const {
        date,
        teacherId,
        classId,
        schedule,
        presentReports,
        absenceReports,
        escapeReports,
        violationReports,
      } = req.body;

      const newReport = await classReportService.createClassReport({
        date,
        teacherId,
        classId,
        schedule,
        presentReports,
        absenceReports,
        escapeReports,
        violationReports,
      });

      res.status(201).json({
        message: "تم إنشاء التقرير بنجاح",
        report: newReport,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في إنشاء التقرير",
      });
    }
  }

  async updateClassReport(req, res) {
    try {
      const {
        date,
        teacherId,
        classId,
        schedule,
        presentReports,
        absenceReports,
        escapeReports,
        violationReports,
      } = req.body;

      const updatedReport = await classReportService.updateClassReport(
        req.params.id,
        {
          date,
          teacherId,
          classId,
          schedule,
          presentReports,
          absenceReports,
          escapeReports,
          violationReports,
        },
      );

      res.status(200).json({
        message: "تم تحديث التقرير بنجاح",
        report: updatedReport,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في تحديث التقرير",
      });
    }
  }

  async deleteClassReport(req, res) {
    try {
      const result = await classReportService.deleteClassReport(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في حذف التقرير",
      });
    }
  }
}

module.exports = new ClassReportController();
