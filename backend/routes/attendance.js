const express = require("express");
const router = express.Router();
const {
  recordEntry,
  recordExit,
  getAttendanceByDate,
  getDailySummary,
  getAbsences,
  getEscapes,
  getLates,
  deleteAttendance,
  deleteMultipleAttendance,
} = require("../controllers/attendanceController");

// Record entry
router.post("/entry", recordEntry);

// Record exit
router.post("/exit", recordExit);

// Get attendance records by date
router.get("/by-date", getAttendanceByDate);

// Get attendance summary for a specific date
router.get("/summary", getDailySummary);

// Get absences for a specific date
router.get("/absences", getAbsences);

// Get escapes for a specific date
router.get("/escapes", getEscapes);

// Get lates for a specific date
router.get("/lates", getLates);

// Delete attendance record
router.delete("/:id", deleteAttendance);

// Delete multiple attendance records
router.delete("/", deleteMultipleAttendance);

module.exports = router;
