const express = require("express");
const disciplinaryController = require("../controllers/disciplinaryController");

const router = express.Router();

// Create a new disciplinary request
router.post("/", disciplinaryController.createDisciplinary);

// Get all disciplinary requests
router.get("/", disciplinaryController.getAllDisciplinary);

// Get disciplinary requests by trainee ID
router.get(
  "/trainee/:trainee_id",
  disciplinaryController.getDisciplinaryByTraineeId,
);

// Delete a specific disciplinary request
router.delete("/:id", disciplinaryController.deleteDisciplinary);

// Delete all disciplinary requests for a trainee
router.delete(
  "/trainee/:trainee_id/all",
  disciplinaryController.deleteAllDisciplinaryByTraineeId,
);

module.exports = router;
