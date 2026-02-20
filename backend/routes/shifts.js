const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shiftController");

// Get all shifts
router.get("/", shiftController.getAllShifts);

// Get single shift
router.get("/:id", shiftController.getShift);

// Create shift
router.post("/", shiftController.createShift);

// Update shift
router.put("/:id", shiftController.updateShift);

// Delete shift
router.delete("/:id", shiftController.deleteShift);

module.exports = router;
