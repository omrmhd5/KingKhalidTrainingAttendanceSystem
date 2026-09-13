const classService = require("../services/classService");
const { t } = require("../lib/i18n");
const { sendCaught, localizeResult } = require("../lib/http");

class ClassController {
  async getAllClasses(req, res) {
    try {
      const { teacherId } = req.query;
      const filters = {};
      if (teacherId) filters.teacherId = teacherId;

      const classes = await classService.getAllClasses(filters);
      res.status(200).json(classes);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async getClassById(req, res) {
    try {
      const classItem = await classService.getClassById(req.params.id);
      res.status(200).json(classItem);
    } catch (error) {
      sendCaught(req, res, error, 404);
    }
  }

  async createClass(req, res) {
    try {
      const { name, assignedTeacherId, schedule } = req.body;

      const newClass = await classService.createClass({
        name,
        assignedTeacherId,
        schedule,
      });

      res.status(201).json({
        message: t(req, "success.classCreated"),
        class: newClass,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }

  async updateClass(req, res) {
    try {
      const { name, assignedTeacherId, schedule } = req.body;

      const updatedClass = await classService.updateClass(req.params.id, {
        name,
        assignedTeacherId,
        schedule,
      });

      res.status(200).json({
        message: t(req, "success.classUpdated"),
        class: updatedClass,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }

  async deleteClass(req, res) {
    try {
      const result = await classService.deleteClass(req.params.id);
      res.status(200).json(localizeResult(req, result));
    } catch (error) {
      sendCaught(req, res, error, 400);
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
        message: t(req, "success.studentsAssigned"),
        class: updatedClass,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
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
        message: t(req, "success.studentRemoved"),
        class: updatedClass,
      });
    } catch (error) {
      sendCaught(req, res, error, 400);
    }
  }
}

module.exports = new ClassController();
