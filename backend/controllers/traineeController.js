const traineeService = require("../services/traineeService");
const { t } = require("../lib/i18n");
const { sendError, sendCaught } = require("../lib/http");

exports.getAllTrainees = async (req, res) => {
  try {
    const trainees = await traineeService.getAllTrainees();
    res.json(trainees);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.getTrainee = async (req, res) => {
  try {
    const trainee = await traineeService.getTraineeById(req.params.id);
    if (!trainee) {
      return sendError(req, res, 404, "errors.traineeNotFound");
    }
    res.json(trainee);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.createTrainee = async (req, res) => {
  try {
    const trainee = await traineeService.createTrainee(req.body);
    res.status(201).json(trainee);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.updateTrainee = async (req, res) => {
  try {
    const trainee = await traineeService.updateTrainee(req.params.id, req.body);
    if (!trainee) {
      return sendError(req, res, 404, "errors.traineeNotFound");
    }
    res.json(trainee);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.deleteTrainee = async (req, res) => {
  try {
    const trainee = await traineeService.deleteTrainee(req.params.id);
    res.json(trainee);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.searchByIds = async (req, res) => {
  try {
    const { ids, searchType } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(req, res, 400, "errors.idsRequired");
    }
    if (!searchType || !["military", "civil"].includes(searchType)) {
      return sendError(req, res, 400, "errors.invalidSearchType");
    }
    const trainees = await traineeService.searchByIds(ids, searchType);
    res.json(trainees);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.bulkUpdateShift = async (req, res) => {
  try {
    const { ids, shiftId } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(req, res, 400, "errors.idsRequired");
    }
    if (!shiftId) {
      return sendError(req, res, 400, "errors.shiftIdRequired");
    }
    const result = await traineeService.bulkUpdateShift(ids, shiftId);
    res.json(result);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.bulkImportTrainees = async (req, res) => {
  try {
    const { trainees } = req.body;
    if (!trainees || !Array.isArray(trainees)) {
      return sendError(req, res, 400, "errors.traineesArrayRequired");
    }
    const results = await traineeService.bulkImportTrainees(trainees);
    if (Array.isArray(results.errors)) {
      results.errors = results.errors.map((item) => ({
        ...item,
        error: t(req, item.error, item.vars || {}),
      }));
    }
    res.status(201).json(results);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};
