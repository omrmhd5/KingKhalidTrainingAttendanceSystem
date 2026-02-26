const violationService = require("../services/violationService");

class ViolationController {
  async createViolation(req, res) {
    try {
      const { trainee_id, description } = req.body;

      if (!trainee_id || !description) {
        return res.status(400).json({
          message: "trainee_id and description are required",
        });
      }

      const violation = await violationService.createViolation(
        trainee_id,
        description,
      );

      res.status(201).json(violation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getViolationsByTraineeId(req, res) {
    try {
      const { trainee_id } = req.params;

      const violations =
        await violationService.getViolationsByTraineeId(trainee_id);

      res.status(200).json(violations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllViolations(req, res) {
    try {
      const violations = await violationService.getAllViolations();

      res.status(200).json(violations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateViolation(req, res) {
    try {
      const { id } = req.params;
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({
          message: "description is required",
        });
      }

      const violation = await violationService.updateViolation(id, description);

      res.status(200).json(violation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteViolation(req, res) {
    try {
      const { id } = req.params;

      const violation = await violationService.deleteViolation(id);

      res.status(200).json({
        message: "Violation deleted successfully",
        violation,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteAllViolationsByTraineeId(req, res) {
    try {
      const { trainee_id } = req.params;

      await violationService.deleteAllViolationsByTraineeId(trainee_id);

      res.status(200).json({
        message: "All violations for trainee deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ViolationController();
