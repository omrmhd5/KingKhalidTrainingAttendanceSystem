const express = require("express");
const router = express.Router();
const classTimeScheduleController = require("../controllers/classTimeScheduleController");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authMiddleware");

// View operations - all authenticated users
router.get("/", classTimeScheduleController.getAllSchedules);
router.get("/:id", classTimeScheduleController.getScheduleById);

// Write operations - admin only
router.post("/", requireAdmin, classTimeScheduleController.createSchedule);
router.put("/:id", requireAdmin, classTimeScheduleController.updateSchedule);
router.delete("/:id", requireAdmin, classTimeScheduleController.deleteSchedule);

// Class assignment operations
router.post(
  "/:id/classes",
  requireAdmin,
  classTimeScheduleController.assignClasses,
);
router.delete(
  "/:id/classes/:classId",
  requireAdmin,
  classTimeScheduleController.removeClass,
);

module.exports = router;
