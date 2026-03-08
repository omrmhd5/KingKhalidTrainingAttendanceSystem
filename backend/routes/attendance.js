const express = require("express");
const router = express.Router();
const {
  recordEntry,
  recordExit,
  getAttendanceByDate,
  getDailySummary,
} = require("../controllers/attendanceController");

// Record entry
router.post("/entry", recordEntry);

// Record exit
router.post("/exit", recordExit);

// Get attendance records by date
router.get("/by-date", getAttendanceByDate);

// Get attendance summary for a specific date
router.get("/summary", getDailySummary);

module.exports = router;
