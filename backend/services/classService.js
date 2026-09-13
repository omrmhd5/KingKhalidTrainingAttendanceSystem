const Class = require("../models/Class");
const User = require("../models/User");
const Trainee = require("../models/Trainee");
const ClassTimeSchedule = require("../models/ClassTimeSchedule");

class ClassService {
  async getAllClasses(filters = {}) {
    const query = {};

    // Filter by teacher if provided
    if (filters.teacherId) {
      query.assignedTeacherId = filters.teacherId;
    }

    return await Class.find(query)
      .populate("assignedTeacherId", "username email")
      .populate("schedule", "name start_time end_time")
      .populate("students", "full_name civil_id military_id")
      .sort({ createdAt: -1 });
  }

  async getClassById(id) {
    const classItem = await Class.findById(id)
      .populate("assignedTeacherId", "username email")
      .populate("schedule", "name start_time end_time")
      .populate("students", "full_name civil_id military_id");

    if (!classItem) {
      throw new Error("errors.classNotFound");
    }

    return classItem;
  }

  async createClass(data) {
    const { name, assignedTeacherId, schedule } = data;

    // Validation
    if (!name || !name.trim()) {
      throw new Error("errors.classNameRequired");
    }

    // Schedule is required
    if (!schedule) {
      throw new Error("errors.classScheduleRequired");
    }

    // Check if class name already exists
    const existingClass = await Class.findOne({ name: name.trim() });
    if (existingClass) {
      throw new Error("errors.classExists");
    }

    // Validate teacher if provided
    if (assignedTeacherId) {
      const teacher = await User.findById(assignedTeacherId);
      if (!teacher) {
        throw new Error("errors.teacherNotFound");
      }
      if (teacher.role !== "teacher") {
        throw new Error("errors.mustBeTeacher");
      }
    }

    // Validate schedule - it's required
    const scheduleItem = await ClassTimeSchedule.findById(schedule);
    if (!scheduleItem) {
      throw new Error("errors.scheduleNotFound");
    }

    // Create class
    const newClass = new Class({
      name: name.trim(),
      assignedTeacherId: assignedTeacherId || null,
      schedule: schedule,
    });

    await newClass.save();

    // Add class to schedule's classes array
    await ClassTimeSchedule.findByIdAndUpdate(
      schedule,
      { $addToSet: { classes: newClass._id } },
      { new: true },
    );

    // Re-query to get populated data
    return await Class.findById(newClass._id)
      .populate("assignedTeacherId", "username email")
      .populate("schedule", "name start_time end_time");
  }

  async updateClass(id, data) {
    const { name, assignedTeacherId, schedule } = data;
    const classItem = await Class.findById(id);

    if (!classItem) {
      throw new Error("errors.classNotFound");
    }

    // Validation
    if (name) {
      if (!name.trim()) {
        throw new Error("errors.classNameRequired");
      }

      // Check if new name already exists (excluding current class)
      const existingClass = await Class.findOne({
        _id: { $ne: id },
        name: name.trim(),
      });
      if (existingClass) {
        throw new Error("errors.classExists");
      }

      classItem.name = name.trim();
    }

    // Validate and update teacher
    if (assignedTeacherId !== undefined) {
      if (assignedTeacherId) {
        const teacher = await User.findById(assignedTeacherId);
        if (!teacher) {
          throw new Error("errors.teacherNotFound");
        }
        if (teacher.role !== "teacher") {
          throw new Error("errors.mustBeTeacher");
        }
        classItem.assignedTeacherId = assignedTeacherId;
      } else {
        classItem.assignedTeacherId = null;
      }
    }

    // Handle schedule update with bidirectional sync
    if (schedule !== undefined) {
      // Validate that schedule exists
      const scheduleItem = await ClassTimeSchedule.findById(schedule);
      if (!scheduleItem) {
        throw new Error("errors.scheduleNotFound");
      }

      // Remove class from old schedule
      if (classItem.schedule && classItem.schedule.toString() !== schedule) {
        await ClassTimeSchedule.findByIdAndUpdate(
          classItem.schedule,
          { $pull: { classes: classItem._id } },
          { new: true },
        );
      }

      // Add class to new schedule
      await ClassTimeSchedule.findByIdAndUpdate(
        schedule,
        { $addToSet: { classes: classItem._id } },
        { new: true },
      );

      classItem.schedule = schedule;
    }

    await classItem.save();
    // Re-query to get populated data
    return await Class.findById(classItem._id)
      .populate("assignedTeacherId", "username email")
      .populate("schedule", "name start_time end_time");
  }

  async deleteClass(id) {
    const classItem = await Class.findById(id);

    if (!classItem) {
      throw new Error("errors.classNotFound");
    }

    // Check if class has students
    if (classItem.students && classItem.students.length > 0) {
      const err = new Error("errors.classHasStudents");
      err.vars = { count: classItem.students.length };
      throw err;
    }

    // Remove teacher from this class
    if (classItem.assignedTeacherId) {
      await User.findByIdAndUpdate(classItem.assignedTeacherId, {
        class: null,
      });
    }

    // Remove class from schedule if it exists
    if (classItem.schedule) {
      await ClassTimeSchedule.findByIdAndUpdate(
        classItem.schedule,
        { $pull: { classes: classItem._id } },
        { new: true },
      );
    }

    await Class.findByIdAndDelete(id);
    return { message: "success.classDeleted" };
  }

  async assignStudentsToClass(classId, studentIds) {
    const classItem = await Class.findById(classId);

    if (!classItem) {
      throw new Error("errors.classNotFound");
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error("errors.studentsRequired");
    }

    // Add new students, avoiding duplicates
    for (const studentId of studentIds) {
      if (!classItem.students.includes(studentId)) {
        classItem.students.push(studentId);
      }
    }

    // Update trainee's class field
    await Trainee.updateMany({ _id: { $in: studentIds } }, { class: classId });

    await classItem.save();
    return await classItem.populate(
      "students",
      "full_name civil_id military_id",
    );
  }

  async removeStudentFromClass(classId, studentId) {
    const classItem = await Class.findById(classId);

    if (!classItem) {
      throw new Error("errors.classNotFound");
    }

    classItem.students = classItem.students.filter(
      (id) => id.toString() !== studentId,
    );

    // Clear the trainee's class field
    await Trainee.findByIdAndUpdate(studentId, { class: null });

    await classItem.save();
    return await classItem.populate(
      "students",
      "full_name civil_id military_id",
    );
  }

  async updateClassStats(classId, stats) {
    const classItem = await Class.findById(classId);

    if (!classItem) {
      throw new Error("errors.classNotFound");
    }

    if (stats.present !== undefined) classItem.stats.present = stats.present;
    if (stats.absence !== undefined) classItem.stats.absence = stats.absence;
    if (stats.escapes !== undefined) classItem.stats.escapes = stats.escapes;
    if (stats.violations !== undefined)
      classItem.stats.violations = stats.violations;

    await classItem.save();
    return classItem;
  }

  async incrementClassStat(classId, statName) {
    const classItem = await Class.findById(classId);

    if (!classItem) {
      throw new Error("errors.classNotFound");
    }

    if (!["present", "absence", "escapes", "violations"].includes(statName)) {
      throw new Error("errors.invalidStat");
    }

    classItem.stats[statName] += 1;
    await classItem.save();
    return classItem;
  }

  async assignTeacherToClass(teacherId, classId) {
    // Validate teacher exists and is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      throw new Error("errors.teacherNotFound");
    }
    if (teacher.role !== "teacher") {
      throw new Error("errors.mustBeTeacher");
    }

    // Find and unassign teacher from any previous class
    await Class.updateMany(
      { assignedTeacherId: teacherId },
      { assignedTeacherId: null },
    );

    // Assign teacher to new class
    const classItem = await Class.findById(classId);
    if (!classItem) {
      throw new Error("errors.classNotFound");
    }

    classItem.assignedTeacherId = teacherId;
    await classItem.save();
    return await classItem.populate("assignedTeacherId", "username email");
  }

  async unassignTeacherFromClass(classId) {
    const classItem = await Class.findById(classId);

    if (!classItem) {
      throw new Error("errors.classNotFound");
    }

    classItem.assignedTeacherId = null;
    await classItem.save();
    return classItem;
  }
}

module.exports = new ClassService();
