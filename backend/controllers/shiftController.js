const shiftService = require("../services/shiftService");
const { t } = require("../lib/i18n");
const { sendError, sendCaught } = require("../lib/http");

exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await shiftService.getAllShifts();
    res.json(shifts);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.getShift = async (req, res) => {
  try {
    const shift = await shiftService.getShiftById(req.params.id);
    if (!shift) {
      return sendError(req, res, 404, "errors.shiftNotFound");
    }
    res.json(shift);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.createShift = async (req, res) => {
  try {
    const shift = await shiftService.createShift(req.body);
    res.status(201).json(shift);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.updateShift = async (req, res) => {
  try {
    const shift = await shiftService.updateShift(req.params.id, req.body);
    res.json(shift);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.deleteShift = async (req, res) => {
  try {
    await shiftService.deleteShift(req.params.id);
    res.json({ message: t(req, "success.shiftDeleted") });
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};
