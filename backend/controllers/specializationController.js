const specializationService = require("../services/specializationService");
const { sendError, sendCaught } = require("../lib/http");

exports.getAllSpecializations = async (req, res) => {
  try {
    const specializations = await specializationService.getAllSpecializations();
    res.json(specializations);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.getSpecialization = async (req, res) => {
  try {
    const specialization = await specializationService.getSpecializationById(
      req.params.id,
    );
    if (!specialization) {
      return sendError(req, res, 404, "errors.specNotFound");
    }
    res.json(specialization);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.createSpecialization = async (req, res) => {
  try {
    const specialization = await specializationService.createSpecialization(
      req.body,
    );
    res.status(201).json(specialization);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.updateSpecialization = async (req, res) => {
  try {
    const specialization = await specializationService.updateSpecialization(
      req.params.id,
      req.body,
    );
    if (!specialization) {
      return sendError(req, res, 404, "errors.specNotFound");
    }
    res.json(specialization);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.deleteSpecialization = async (req, res) => {
  try {
    const specialization = await specializationService.deleteSpecialization(
      req.params.id,
    );
    res.json(specialization);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};
