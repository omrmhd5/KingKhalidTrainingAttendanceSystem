const classTimeScheduleService = require("../services/classTimeScheduleService");

class ClassTimeScheduleController {
  async getAllSchedules(req, res) {
    try {
      const schedules = await classTimeScheduleService.getAllSchedules();
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({
        message: error.message || "فشل في تحميل الجداول الزمنية",
      });
    }
  }

  async getScheduleById(req, res) {
    try {
      const schedule = await classTimeScheduleService.getScheduleById(
        req.params.id,
      );
      res.status(200).json(schedule);
    } catch (error) {
      res.status(404).json({
        message: error.message || "الجدول الزمني غير موجود",
      });
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
        message: "تم إنشاء الجدول الزمني بنجاح",
        schedule: newSchedule,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في إنشاء الجدول الزمني",
      });
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
        message: "تم تحديث الجدول الزمني بنجاح",
        schedule: updatedSchedule,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في تحديث الجدول الزمني",
      });
    }
  }

  async deleteSchedule(req, res) {
    try {
      const result = await classTimeScheduleService.deleteSchedule(
        req.params.id,
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في حذف الجدول الزمني",
      });
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
        message: "تم تعيين الفصول بنجاح",
        schedule: updatedSchedule,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في تعيين الفصول",
      });
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
        message: "تم إزالة الفصل بنجاح",
        schedule: updatedSchedule,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في إزالة الفصل",
      });
    }
  }
}

module.exports = new ClassTimeScheduleController();
