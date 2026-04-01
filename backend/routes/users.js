const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateToken,
  requireAdmin,
  requireAdminOrOperator,
} = require("../middleware/authMiddleware");

// Public routes
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Protected routes (require authentication)
router.get("/me", authenticateToken, userController.getCurrentUser);

// Admin routes (require admin role)
router.get(
  "/",
  authenticateToken,
  requireAdminOrOperator,
  userController.getAllUsers,
);
router.get("/:id", authenticateToken, requireAdmin, userController.getUserById);
router.post("/", authenticateToken, requireAdmin, userController.createUser);
router.put("/:id", authenticateToken, requireAdmin, userController.updateUser);
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  userController.deleteUser,
);
router.patch(
  "/:id/toggle-status",
  authenticateToken,
  requireAdmin,
  userController.toggleUserStatus,
);

module.exports = router;
