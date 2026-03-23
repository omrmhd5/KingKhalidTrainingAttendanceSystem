const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shiftController");
const {
  requireAdmin,
  requireAdminOrOperator,
} = require("../middleware/authMiddleware");

// View operations - allowed for admin and operator
router.get("/", requireAdminOrOperator, shiftController.getAllShifts);

// Get single shift
router.get("/:id", requireAdminOrOperator, shiftController.getShift);

// Create shift - admin only
router.post("/", requireAdmin, shiftController.createShift);

// Update shift - admin only
router.put("/:id", requireAdmin, shiftController.updateShift);

// Delete shift - admin only
router.delete("/:id", requireAdmin, shiftController.deleteShift);

module.exports = router;
