const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authMiddleware");

// View operations - all authenticated users
router.get("/", classController.getAllClasses);

// Stats operations (specific routes first to avoid :id catch-all)
router.get("/:id/stats", classController.getClassStats);
router.put("/:id/stats", requireAdmin, classController.updateClassStats);
router.post("/:id/stats/:statName/increment", classController.incrementStat);

// Student operations
router.post("/:id/students", requireAdmin, classController.assignStudents);
router.delete(
  "/:id/students/:studentId",
  requireAdmin,
  classController.removeStudent,
);

// General class operations
router.get("/:id", classController.getClassById);
router.post("/", requireAdmin, classController.createClass);
router.put("/:id", requireAdmin, classController.updateClass);
router.delete("/:id", requireAdmin, classController.deleteClass);

module.exports = router;
