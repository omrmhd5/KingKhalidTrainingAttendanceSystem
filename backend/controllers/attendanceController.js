const attendanceService = require("../services/attendanceService");

exports.recordEntry = async (req, res) => {
  try {
    const { military_id, shift_id, date } = req.body;
    const result = await attendanceService.recordEntry(
      military_id,
      shift_id,
      date,
    );
    res.status(201).json({ ...result, message: "Entry recorded successfully" });
  } catch (error) {
    const statusCode =
      error.code === "MISSING_FIELDS" || error.code === "INVALID_DATE"
        ? 400
        : error.code === "TRAINEE_NOT_FOUND" || error.code === "SHIFT_NOT_FOUND"
          ? 404
          : error.code === "DUPLICATE_ENTRY"
            ? 409
            : 500;
    res.status(statusCode).json({
      error: error.code || "SERVER_ERROR",
      message: error.message,
    });
  }
};

exports.recordExit = async (req, res) => {
  try {
    const { military_id, date } = req.body;
    const result = await attendanceService.recordExit(military_id, date);
    res.status(200).json({ ...result, message: "Exit recorded successfully" });
  } catch (error) {
    const statusCode =
      error.code === "MISSING_FIELDS" || error.code === "INVALID_DATE"
        ? 400
        : error.code === "TRAINEE_NOT_FOUND" || error.code === "NO_ENTRY"
          ? 404
          : error.code === "DUPLICATE_EXIT"
            ? 409
            : 500;
    res.status(statusCode).json({
      error: error.code || "SERVER_ERROR",
      message: error.message,
    });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date, shift_id } = req.query;
    const result = await attendanceService.getAttendanceByDate(date, shift_id);
    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.code === "MISSING_FIELDS" ? 400 : 500;
    res.status(statusCode).json({
      error: error.code || "SERVER_ERROR",
      message: error.message,
    });
  }
};

exports.getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await attendanceService.getDailySummary(date);
    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.code === "MISSING_FIELDS" ? 400 : 500;
    res.status(statusCode).json({
      error: error.code || "SERVER_ERROR",
      message: error.message,
    });
  }
};

exports.getAbsences = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await attendanceService.getAbsences(date);
    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.code === "MISSING_FIELDS" ? 400 : 500;
    res.status(statusCode).json({
      error: error.code || "SERVER_ERROR",
      message: error.message,
    });
  }
};

exports.getEscapes = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await attendanceService.getEscapes(date);
    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.code === "MISSING_FIELDS" ? 400 : 500;
    res.status(statusCode).json({
      error: error.code || "SERVER_ERROR",
      message: error.message,
    });
  }
};
