const violationService = require("../services/violationService");
const { t } = require("../lib/i18n");
const { sendError, sendCaught } = require("../lib/http");

class ViolationController {
  async createViolation(req, res) {
    try {
      const { trainee_id, description } = req.body;

      if (!trainee_id || !description) {
        return sendError(req, res, 400, "errors.traineeAndDescriptionRequired");
      }

      const violation = await violationService.createViolation(
        trainee_id,
        description,
      );

      res.status(201).json(violation);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async getViolationsByTraineeId(req, res) {
    try {
      const { trainee_id } = req.params;
      const violations =
        await violationService.getViolationsByTraineeId(trainee_id);
      res.status(200).json(violations);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async getAllViolations(req, res) {
    try {
      const violations = await violationService.getAllViolations();
      res.status(200).json(violations);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async updateViolation(req, res) {
    try {
      const { id } = req.params;
      const { description } = req.body;

      if (!description) {
        return sendError(req, res, 400, "errors.descriptionRequired");
      }

      const violation = await violationService.updateViolation(id, description);
      res.status(200).json(violation);
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async deleteViolation(req, res) {
    try {
      const { id } = req.params;
      const violation = await violationService.deleteViolation(id);
      res.status(200).json({
        message: t(req, "success.violationDeleted"),
        violation,
      });
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }

  async deleteAllViolationsByTraineeId(req, res) {
    try {
      const { trainee_id } = req.params;
      await violationService.deleteAllViolationsByTraineeId(trainee_id);
      res.status(200).json({
        message: t(req, "success.allViolationsDeleted"),
      });
    } catch (error) {
      sendCaught(req, res, error, 500);
    }
  }
}

module.exports = new ViolationController();
