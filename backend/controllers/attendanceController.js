const attendanceService = require("../services/attendanceService");
const { t } = require("../lib/i18n");
const { sendError, sendCaught, localizeResult, resolveMessage } = require("../lib/http");

function attendanceStatus(error) {
  if (error.code === "MISSING_FIELDS" || error.code === "INVALID_DATE") return 400;
  if (
    error.code === "TRAINEE_NOT_FOUND" ||
    error.code === "SHIFT_NOT_FOUND" ||
    error.code === "NO_ENTRY"
  ) {
    return 404;
  }
  if (error.code === "DUPLICATE_ENTRY" || error.code === "DUPLICATE_EXIT") return 409;
  return 500;
}

function sendAttendanceError(req, res, error) {
  const status = error.code ? attendanceStatus(error) : 400;
  return res.status(status).json({
    error: error.code || "SERVER_ERROR",
    message: resolveMessage(req, error),
  });
}

exports.recordEntry = async (req, res) => {
  try {
    const { scannedId, shift_id, date } = req.body;
    const result = await attendanceService.recordEntry(
      scannedId,
      shift_id,
      date,
    );
    res.status(201).json({ ...result, message: t(req, "success.entryRecorded") });
  } catch (error) {
    sendAttendanceError(req, res, error);
  }
};

exports.recordExit = async (req, res) => {
  try {
    const { scannedId, date } = req.body;
    const result = await attendanceService.recordExit(scannedId, date);
    res.status(200).json({ ...result, message: t(req, "success.exitRecorded") });
  } catch (error) {
    sendAttendanceError(req, res, error);
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date, shift_id } = req.query;
    const result = await attendanceService.getAttendanceByDate(date, shift_id);
    res.status(200).json(result);
  } catch (error) {
    sendAttendanceError(req, res, error);
  }
};

exports.getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await attendanceService.getDailySummary(date);
    res.status(200).json(result);
  } catch (error) {
    sendAttendanceError(req, res, error);
  }
};

exports.getAbsences = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await attendanceService.getAbsences(date);
    res.status(200).json(result);
  } catch (error) {
    sendAttendanceError(req, res, error);
  }
};

exports.getEscapes = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await attendanceService.getEscapes(date);
    res.status(200).json(result);
  } catch (error) {
    sendAttendanceError(req, res, error);
  }
};

exports.getLates = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await attendanceService.getLates(date);
    res.status(200).json(result);
  } catch (error) {
    sendAttendanceError(req, res, error);
  }
};

exports.clearExitData = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(req, res, 400, "errors.idsRequired");
    }
    const result = await attendanceService.clearExitData(ids);
    res.status(200).json(localizeResult(req, result));
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await attendanceService.deleteAttendance(id);
    res.status(200).json(localizeResult(req, result));
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.deleteMultipleAttendance = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await attendanceService.deleteMultipleAttendance(ids);
    res.status(200).json(localizeResult(req, result));
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};
