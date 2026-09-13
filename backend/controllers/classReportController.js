const classReportService = require("../services/classReportService");
const { t } = require("../lib/i18n");
const { sendCaught, localizeResult } = require("../lib/http");

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
      sendCaught(req, res, error, 500);
    }
  }

  async getClassReportById(req, res) {
    try {
      const report = await classReportService.getClassReportById(req.params.id);
      res.status(200).json(report);
    } catch (error) {
      sendCaught(req, res, error, 404);
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
        courseReports,
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
        courseReports,
        violationReports,
      });

      res.status(201).json({
        message: t(req, "success.reportCreated"),
        report: newReport,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
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
        courseReports,
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
          courseReports,
          violationReports,
        },
      );

      res.status(200).json({
        message: t(req, "success.reportUpdated"),
        report: updatedReport,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }

  async deleteClassReport(req, res) {
    try {
      const result = await classReportService.deleteClassReport(req.params.id);
      res.status(200).json(localizeResult(req, result));
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }
}

module.exports = new ClassReportController();
