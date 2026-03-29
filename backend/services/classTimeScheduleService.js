const ClassTimeSchedule = require("../models/ClassTimeSchedule");
const Class = require("../models/Class");

class ClassTimeScheduleService {
  async getAllSchedules() {
    return await ClassTimeSchedule.find()
      .populate("classes", "name")
      .sort({ createdAt: -1 });
  }

  async getScheduleById(id) {
    const schedule = await ClassTimeSchedule.findById(id).populate(
      "classes",
      "name",
    );

    if (!schedule) {
      throw new Error("الجدول الزمني غير موجود");
    }

    return schedule;
  }

  async createSchedule(data) {
    const { name, start_time, end_time } = data;

    // Validation
    if (!name || !name.trim()) {
      throw new Error("اسم الجدول مطلوب");
    }

    if (!start_time) {
      throw new Error("وقت البداية مطلوب");
    }

    if (!end_time) {
      throw new Error("وقت النهاية مطلوب");
    }

    // Check if schedule name already exists
    const existingSchedule = await ClassTimeSchedule.findOne({
      name: name.trim(),
    });
    if (existingSchedule) {
      throw new Error("هذا الجدول الزمني موجود بالفعل");
    }

    // Create schedule
    const newSchedule = new ClassTimeSchedule({
      name: name.trim(),
      start_time,
      end_time,
      classes: [],
    });

    await newSchedule.save();
    return await newSchedule.populate("classes", "name");
  }

  async updateSchedule(id, data) {
    const { name, start_time, end_time } = data;
    const schedule = await ClassTimeSchedule.findById(id);

    if (!schedule) {
      throw new Error("الجدول الزمني غير موجود");
    }

    // Validation
    if (name) {
      if (!name.trim()) {
        throw new Error("اسم الجدول مطلوب");
      }

      // Check if new name already exists (excluding current schedule)
      const existingSchedule = await ClassTimeSchedule.findOne({
        _id: { $ne: id },
        name: name.trim(),
      });
      if (existingSchedule) {
        throw new Error("هذا الجدول الزمني موجود بالفعل");
      }

      schedule.name = name.trim();
    }

    if (start_time) {
      schedule.start_time = start_time;
    }

    if (end_time) {
      schedule.end_time = end_time;
    }

    await schedule.save();
    return await schedule.populate("classes", "name");
  }

  async deleteSchedule(id) {
    const schedule = await ClassTimeSchedule.findById(id);

    if (!schedule) {
      throw new Error("الجدول الزمني غير موجود");
    }

    // Check if schedule has classes assigned
    if (schedule.classes && schedule.classes.length > 0) {
      throw new Error(
        `لا يمكن حذف الجدول الزمني لأنه يحتوي على ${schedule.classes.length} فصل/فصول. الرجاء إزالة جميع الفصول أولاً.`,
      );
    }

    await ClassTimeSchedule.findByIdAndDelete(id);
    return { message: "تم حذف الجدول الزمني بنجاح" };
  }

  async assignClassesToSchedule(scheduleId, classIds) {
    const schedule = await ClassTimeSchedule.findById(scheduleId);

    if (!schedule) {
      throw new Error("الجدول الزمني غير موجود");
    }

    if (!Array.isArray(classIds) || classIds.length === 0) {
      throw new Error("يجب توفير قائمة بالفصول");
    }

    // Verify all classes exist
    const classes = await Class.find({ _id: { $in: classIds } });
    if (classes.length !== classIds.length) {
      throw new Error("بعض الفصول غير موجودة");
    }

    // Add new classes, avoiding duplicates
    for (const classId of classIds) {
      if (!schedule.classes.includes(classId)) {
        schedule.classes.push(classId);
      }
    }

    await schedule.save();
    return await schedule.populate("classes", "name");
  }

  async removeClassFromSchedule(scheduleId, classId) {
    const schedule = await ClassTimeSchedule.findById(scheduleId);

    if (!schedule) {
      throw new Error("الجدول الزمني غير موجود");
    }

    schedule.classes = schedule.classes.filter(
      (id) => id.toString() !== classId,
    );

    await schedule.save();
    return await schedule.populate("classes", "name");
  }
}

module.exports = new ClassTimeScheduleService();
