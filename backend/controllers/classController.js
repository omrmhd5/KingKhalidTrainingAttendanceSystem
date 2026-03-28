const classService = require("../services/classService");

class ClassController {
  async getAllClasses(req, res) {
    try {
      const { teacherId } = req.query;
      const filters = {};
      if (teacherId) filters.teacherId = teacherId;

      const classes = await classService.getAllClasses(filters);
      res.status(200).json(classes);
    } catch (error) {
      res.status(500).json({
        message: error.message || "فشل في تحميل الفصول",
      });
    }
  }

  async getClassById(req, res) {
    try {
      const classItem = await classService.getClassById(req.params.id);
      res.status(200).json(classItem);
    } catch (error) {
      res.status(404).json({
        message: error.message || "الفصل غير موجود",
      });
    }
  }

  async createClass(req, res) {
    try {
      const { name, assignedTeacherId } = req.body;

      const newClass = await classService.createClass({
        name,
        assignedTeacherId,
      });

      res.status(201).json({
        message: "تم إنشاء الفصل بنجاح",
        class: newClass,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في إنشاء الفصل",
      });
    }
  }

  async updateClass(req, res) {
    try {
      const { name, assignedTeacherId } = req.body;

      const updatedClass = await classService.updateClass(req.params.id, {
        name,
        assignedTeacherId,
      });

      res.status(200).json({
        message: "تم تحديث الفصل بنجاح",
        class: updatedClass,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في تحديث الفصل",
      });
    }
  }

  async deleteClass(req, res) {
    try {
      const result = await classService.deleteClass(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في حذف الفصل",
      });
    }
  }

  async assignStudents(req, res) {
    try {
      const { studentIds } = req.body;

      const updatedClass = await classService.assignStudentsToClass(
        req.params.id,
        studentIds,
      );

      res.status(200).json({
        message: "تم تعيين الطلاب بنجاح",
        class: updatedClass,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في تعيين الطلاب",
      });
    }
  }

  async removeStudent(req, res) {
    try {
      const { studentId } = req.params;

      const updatedClass = await classService.removeStudentFromClass(
        req.params.id,
        studentId,
      );

      res.status(200).json({
        message: "تم إزالة الطالب بنجاح",
        class: updatedClass,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في إزالة الطالب",
      });
    }
  }

  async getClassStats(req, res) {
    try {
      const classItem = await classService.getClassById(req.params.id);
      res.status(200).json(classItem.stats);
    } catch (error) {
      res.status(404).json({
        message: error.message || "الفصل غير موجود",
      });
    }
  }

  async updateClassStats(req, res) {
    try {
      const { stats } = req.body;

      const updatedClass = await classService.updateClassStats(
        req.params.id,
        stats,
      );

      res.status(200).json({
        message: "تم تحديث الإحصائيات بنجاح",
        class: updatedClass,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في تحديث الإحصائيات",
      });
    }
  }

  async incrementStat(req, res) {
    try {
      const { statName } = req.body;

      const updatedClass = await classService.incrementClassStat(
        req.params.id,
        statName,
      );

      res.status(200).json({
        message: "تم تحديث الإحصائية بنجاح",
        class: updatedClass,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "فشل في تحديث الإحصائية",
      });
    }
  }
}

module.exports = new ClassController();
