const express = require("express");
const specializationController = require("../controllers/specializationController");
const {
  requireAdmin,
  requireAdminOrOperator,
} = require("../middleware/authMiddleware");

const router = express.Router();

// View operations - allowed for admin and operator
router.get(
  "/",
  requireAdminOrOperator,
  specializationController.getAllSpecializations,
);
router.get(
  "/:id",
  requireAdminOrOperator,
  specializationController.getSpecialization,
);

// Write operations - admin only
router.post("/", requireAdmin, specializationController.createSpecialization);
router.put("/:id", requireAdmin, specializationController.updateSpecialization);
router.delete(
  "/:id",
  requireAdmin,
  specializationController.deleteSpecialization,
);

module.exports = router;
