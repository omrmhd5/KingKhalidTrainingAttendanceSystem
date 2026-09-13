const disciplinaryService = require("../services/disciplinaryService");
const { t } = require("../lib/i18n");
const { sendError, sendCaught } = require("../lib/http");

class DisciplinaryController {
  async createDisciplinary(req, res) {
    try {
      const { trainee_id, reason } = req.body;

      if (!trainee_id) {
        return sendError(req, res, 400, "errors.traineeIdRequired");
      }

      if (!reason || !reason.trim()) {
        return sendError(req, res, 400, "errors.reasonRequired");
      }

      const disciplinary = await disciplinaryService.createDisciplinary(
        trainee_id,
        reason.trim(),
      );

      res.status(201).json(disciplinary);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async getDisciplinaryByTraineeId(req, res) {
    try {
      const { trainee_id } = req.params;
      const disciplinary =
        await disciplinaryService.getDisciplinaryByTraineeId(trainee_id);
      res.status(200).json(disciplinary);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async getAllDisciplinary(req, res) {
    try {
      const disciplinary = await disciplinaryService.getAllDisciplinary();
      res.status(200).json(disciplinary);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async updateDisciplinary(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const disciplinary = await disciplinaryService.updateDisciplinary(
        id,
        reason,
      );
      res.status(200).json(disciplinary);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async deleteDisciplinary(req, res) {
    try {
      const { id } = req.params;
      const disciplinary = await disciplinaryService.deleteDisciplinary(id);
      res.status(200).json({
        message: t(req, "success.disciplinaryDeleted"),
        disciplinary,
      });
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async deleteAllDisciplinaryByTraineeId(req, res) {
    try {
      const { trainee_id } = req.params;
      await disciplinaryService.deleteAllDisciplinaryByTraineeId(trainee_id);
      res.status(200).json({
        message: t(req, "success.allDisciplinaryDeleted"),
      });
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }
}

module.exports = new DisciplinaryController();
