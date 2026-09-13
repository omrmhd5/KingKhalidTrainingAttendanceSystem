const classTimeScheduleService = require("../services/classTimeScheduleService");
const { t } = require("../lib/i18n");
const { sendCaught, localizeResult } = require("../lib/http");

class ClassTimeScheduleController {
  async getAllSchedules(req, res) {
    try {
      const schedules = await classTimeScheduleService.getAllSchedules();
      res.status(200).json(schedules);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async getScheduleById(req, res) {
    try {
      const schedule = await classTimeScheduleService.getScheduleById(
        req.params.id,
      );
      res.status(200).json(schedule);
    } catch (error) {
      sendCaught(req, res, error, 404);
    }
  }

  async createSchedule(req, res) {
    try {
      const { name, start_time, end_time } = req.body;

      const newSchedule = await classTimeScheduleService.createSchedule({
        name,
        start_time,
        end_time,
      });

      res.status(201).json({
        message: t(req, "success.scheduleCreated"),
        schedule: newSchedule,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }

  async updateSchedule(req, res) {
    try {
      const { name, start_time, end_time } = req.body;

      const updatedSchedule = await classTimeScheduleService.updateSchedule(
        req.params.id,
        {
          name,
          start_time,
          end_time,
        },
      );

      res.status(200).json({
        message: t(req, "success.scheduleUpdated"),
        schedule: updatedSchedule,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }

  async deleteSchedule(req, res) {
    try {
      const result = await classTimeScheduleService.deleteSchedule(
        req.params.id,
      );
      res.status(200).json(localizeResult(req, result));
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }

  async assignClasses(req, res) {
    try {
      const { classIds } = req.body;

      const updatedSchedule =
        await classTimeScheduleService.assignClassesToSchedule(
          req.params.id,
          classIds,
        );

      res.status(200).json({
        message: t(req, "success.classesAssigned"),
        schedule: updatedSchedule,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }

  async removeClass(req, res) {
    try {
      const { classId } = req.params;

      const updatedSchedule =
        await classTimeScheduleService.removeClassFromSchedule(
          req.params.id,
          classId,
        );

      res.status(200).json({
        message: t(req, "success.classRemovedFromSchedule"),
        schedule: updatedSchedule,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }
}

module.exports = new ClassTimeScheduleController();
