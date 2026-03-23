const express = require("express");
const traineeController = require("../controllers/traineeController");
const {
  requireAdmin,
  requireAdminOrOperator,
} = require("../middleware/authMiddleware");

const router = express.Router();

// View operations - allowed for admin and operator
router.get("/", requireAdminOrOperator, traineeController.getAllTrainees);
router.get("/:id", requireAdminOrOperator, traineeController.getTrainee);
router.post("/search", requireAdminOrOperator, traineeController.searchByIds);

// Write operations - admin only
router.post("/", requireAdmin, traineeController.createTrainee);
router.put("/:id", requireAdmin, traineeController.updateTrainee);
router.delete("/:id", requireAdmin, traineeController.deleteTrainee);

module.exports = router;
