const express = require("express");
const violationController = require("../controllers/violationController");

const router = express.Router();

// Create a new violation
router.post("/", violationController.createViolation);

// Get all violations
router.get("/", violationController.getAllViolations);

// Get violations by trainee ID
router.get(
  "/trainee/:trainee_id",
  violationController.getViolationsByTraineeId,
);

// Update a violation
router.put("/:id", violationController.updateViolation);

// Delete a specific violation
router.delete("/:id", violationController.deleteViolation);

// Delete all violations for a trainee
router.delete(
  "/trainee/:trainee_id/all",
  violationController.deleteAllViolationsByTraineeId,
);

module.exports = router;
