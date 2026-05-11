const disciplinaryService = require("../services/disciplinaryService");

class DisciplinaryController {
  async createDisciplinary(req, res) {
    try {
      const { trainee_id, reason } = req.body;

      if (!trainee_id) {
        return res.status(400).json({
          message: "trainee_id is required",
        });
      }

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          message: "reason is required",
        });
      }

      const disciplinary = await disciplinaryService.createDisciplinary(
        trainee_id,
        reason.trim(),
      );

      res.status(201).json(disciplinary);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getDisciplinaryByTraineeId(req, res) {
    try {
      const { trainee_id } = req.params;

      const disciplinary =
        await disciplinaryService.getDisciplinaryByTraineeId(trainee_id);

      res.status(200).json(disciplinary);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllDisciplinary(req, res) {
    try {
      const disciplinary = await disciplinaryService.getAllDisciplinary();

      res.status(200).json(disciplinary);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      res.status(500).json({ message: error.message });
    }
  }

  async deleteDisciplinary(req, res) {
    try {
      const { id } = req.params;

      const disciplinary = await disciplinaryService.deleteDisciplinary(id);

      res.status(200).json({
        message: "Disciplinary request deleted successfully",
        disciplinary,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteAllDisciplinaryByTraineeId(req, res) {
    try {
      const { trainee_id } = req.params;

      await disciplinaryService.deleteAllDisciplinaryByTraineeId(trainee_id);

      res.status(200).json({
        message: "All disciplinary requests for trainee deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DisciplinaryController();
