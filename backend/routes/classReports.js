const express = require("express");
const router = express.Router();
const classReportController = require("../controllers/classReportController");
const { requireAdminOrOperator } = require("../middleware/authMiddleware");

// View operations - all authenticated users
router.get("/", classReportController.getAllClassReports);

// Get specific report
router.get("/:id", classReportController.getClassReportById);

// Create new report - any authenticated user (teacher can submit their own)
router.post("/", classReportController.createClassReport);

// Update report - any authenticated user
router.put("/:id", classReportController.updateClassReport);

// Delete report - admin/operator only
router.delete(
  "/:id",
  requireAdminOrOperator,
  classReportController.deleteClassReport,
);

module.exports = router;
