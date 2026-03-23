const express = require("express");
const rankController = require("../controllers/rankController");
const {
  requireAdmin,
  requireAdminOrOperator,
} = require("../middleware/authMiddleware");

const router = express.Router();

// View operations - allowed for admin and operator
router.get("/", requireAdminOrOperator, rankController.getAllRanks);
router.get("/:id", requireAdminOrOperator, rankController.getRank);

// Write operations - admin only
router.post("/", requireAdmin, rankController.createRank);
router.put("/:id", requireAdmin, rankController.updateRank);
router.delete("/:id", requireAdmin, rankController.deleteRank);

module.exports = router;
