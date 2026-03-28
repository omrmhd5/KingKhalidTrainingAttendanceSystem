const Class = require("../models/Class");
const User = require("../models/User");
const Trainee = require("../models/Trainee");

class ClassService {
  async getAllClasses(filters = {}) {
    const query = {};

    // Filter by teacher if provided
    if (filters.teacherId) {
      query.assignedTeacherId = filters.teacherId;
    }

    return await Class.find(query)
      .populate("assignedTeacherId", "username email")
      .populate("students", "full_name civil_id military_id")
      .sort({ createdAt: -1 });
  }

  async getClassById(id) {
    const classItem = await Class.findById(id)
      .populate("assignedTeacherId", "username email")
      .populate("students", "full_name civil_id military_id");

    if (!classItem) {
      throw new Error("الفصل غير موجود");
    }

    return classItem;
  }

  async createClass(data) {
    const { name, assignedTeacherId } = data;

    // Validation
    if (!name || !name.trim()) {
      throw new Error("اسم الفصل مطلوب");
    }

    // Check if class name already exists
    const existingClass = await Class.findOne({ name: name.trim() });
    if (existingClass) {
      throw new Error("هذا الفصل موجود بالفعل");
    }

    // Validate teacher if provided
    if (assignedTeacherId) {
      const teacher = await User.findById(assignedTeacherId);
      if (!teacher) {
        throw new Error("المعلم غير موجود");
      }
      if (teacher.role !== "teacher") {
        throw new Error("يجب أن يكون المستخدم معلماً");
      }
    }

    // Create class
    const newClass = new Class({
      name: name.trim(),
      assignedTeacherId: assignedTeacherId || null,
    });

    await newClass.save();
    return await newClass.populate("assignedTeacherId", "username email");
  }

  async updateClass(id, data) {
    const { name, assignedTeacherId } = data;
    const classItem = await Class.findById(id);

    if (!classItem) {
      throw new Error("الفصل غير موجود");
    }

    // Validation
    if (name) {
      if (!name.trim()) {
        throw new Error("اسم الفصل مطلوب");
      }

      // Check if new name already exists (excluding current class)
      const existingClass = await Class.findOne({
        _id: { $ne: id },
        name: name.trim(),
      });
      if (existingClass) {
        throw new Error("هذا الفصل موجود بالفعل");
      }

      classItem.name = name.trim();
    }

    // Validate and update teacher
    if (assignedTeacherId !== undefined) {
      if (assignedTeacherId) {
        const teacher = await User.findById(assignedTeacherId);
        if (!teacher) {
          throw new Error("المعلم غير موجود");
        }
        if (teacher.role !== "teacher") {
          throw new Error("يجب أن يكون المستخدم معلماً");
        }
        classItem.assignedTeacherId = assignedTeacherId;
      } else {
        classItem.assignedTeacherId = null;
      }
    }

    await classItem.save();
    return await classItem.populate("assignedTeacherId", "username email");
  }

  async deleteClass(id) {
    const classItem = await Class.findById(id);

    if (!classItem) {
      throw new Error("الفصل غير موجود");
    }

    // Check if class has students
    if (classItem.students && classItem.students.length > 0) {
      throw new Error(
        `لا يمكن حذف الفصل لأنه يحتوي على ${classItem.students.length} طالب/طالبة. الرجاء إزالة جميع الطلاب أولاً.`,
      );
    }

    // Remove teacher from this class
    if (classItem.assignedTeacherId) {
      await User.findByIdAndUpdate(classItem.assignedTeacherId, {
        class: null,
      });
    }

    await Class.findByIdAndDelete(id);
    return { message: "تم حذف الفصل بنجاح" };
  }

  async assignStudentsToClass(classId, studentIds) {
    const classItem = await Class.findById(classId);

    if (!classItem) {
      throw new Error("الفصل غير موجود");
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error("يجب توفير قائمة بالطلاب");
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
      throw new Error("الفصل غير موجود");
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
      throw new Error("الفصل غير موجود");
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
      throw new Error("الفصل غير موجود");
    }

    if (!["present", "absence", "escapes", "violations"].includes(statName)) {
      throw new Error("إحصائية غير صحيحة");
    }

    classItem.stats[statName] += 1;
    await classItem.save();
    return classItem;
  }

  async assignTeacherToClass(teacherId, classId) {
    // Validate teacher exists and is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      throw new Error("المعلم غير موجود");
    }
    if (teacher.role !== "teacher") {
      throw new Error("يجب أن يكون المستخدم معلماً");
    }

    // Find and unassign teacher from any previous class
    await Class.updateMany(
      { assignedTeacherId: teacherId },
      { assignedTeacherId: null },
    );

    // Assign teacher to new class
    const classItem = await Class.findById(classId);
    if (!classItem) {
      throw new Error("الفصل غير موجود");
    }

    classItem.assignedTeacherId = teacherId;
    await classItem.save();
    return await classItem.populate("assignedTeacherId", "username email");
  }

  async unassignTeacherFromClass(classId) {
    const classItem = await Class.findById(classId);

    if (!classItem) {
      throw new Error("الفصل غير موجود");
    }

    classItem.assignedTeacherId = null;
    await classItem.save();
    return classItem;
  }
}

module.exports = new ClassService();
