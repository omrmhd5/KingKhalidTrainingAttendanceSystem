const jwt = require("jsonwebtoken");
const { sendError } = require("../lib/http");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Authenticate JWT token
const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return sendError(req, res, 401, "errors.authRequired");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(req, res, 401, "errors.invalidToken");
    }
    if (error.name === "TokenExpiredError") {
      return sendError(req, res, 401, "errors.tokenExpired");
    }
    return sendError(req, res, 500, "errors.authError");
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return sendError(req, res, 403, "errors.adminOnly");
  }
  next();
};

// Check if user is admin or operator
const requireAdminOrOperator = (req, res, next) => {
  if (!["admin", "operator"].includes(req.user?.role)) {
    return sendError(req, res, 403, "errors.adminOrOperatorOnly");
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrOperator,
  JWT_SECRET,
};
