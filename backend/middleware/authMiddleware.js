const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Authenticate JWT token
const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Check if user is admin or operator
const requireAdminOrOperator = (req, res, next) => {
  if (!["admin", "operator"].includes(req.user?.role)) {
    return res
      .status(403)
      .json({ message: "Access denied. Admin or Operator only." });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrOperator,
  JWT_SECRET,
};
