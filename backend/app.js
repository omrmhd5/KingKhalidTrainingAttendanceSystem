const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const {
  authenticateToken,
  requireAdmin,
  requireAdminOrOperator,
} = require("./middleware/authMiddleware");
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/king-khalid-training";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const userRoutes = require("./routes/users");
const shiftRoutes = require("./routes/shifts");
const rankRoutes = require("./routes/ranks");
const specializationRoutes = require("./routes/specializations");
const traineeRoutes = require("./routes/trainees");
const violationRoutes = require("./routes/violations");
const disciplinaryRoutes = require("./routes/disciplinary");
const attendanceRoutes = require("./routes/attendance");

app.use("/api/users", userRoutes);
app.use("/api/shifts", authenticateToken, requireAdmin, shiftRoutes);
app.use("/api/ranks", authenticateToken, requireAdmin, rankRoutes);
app.use(
  "/api/specializations",
  authenticateToken,
  requireAdmin,
  specializationRoutes,
);
app.use("/api/trainees", authenticateToken, requireAdmin, traineeRoutes);
app.use(
  "/api/violations",
  authenticateToken,
  requireAdminOrOperator,
  violationRoutes,
);
app.use(
  "/api/disciplinary",
  authenticateToken,
  requireAdminOrOperator,
  disciplinaryRoutes,
);
app.use(
  "/api/attendance",
  authenticateToken,
  requireAdminOrOperator,
  attendanceRoutes,
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Connect to MongoDB

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));
});

module.exports = app;
