const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authMiddleware");

// View operations - all authenticated users
router.get("/", classController.getAllClasses);

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
