const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { join } = require("path");
require("dotenv").config();
const {
  authenticateToken,
  requireAdmin,
  requireAdminOrOperator,
} = require("./middleware/authMiddleware");
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI_LOCAL ||
  "mongodb://127.0.0.1:27017/king-khalid-training-attendance-system-demo";

const app = express();

const corsOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept-Language",
      "X-Language",
    ],
  }),
);
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
const classRoutes = require("./routes/classes");
const classTimeScheduleRoutes = require("./routes/classTimeSchedules");
const classReportRoutes = require("./routes/classReports");

app.use("/api/users", userRoutes);
app.use("/api/shifts", authenticateToken, shiftRoutes);
app.use("/api/ranks", authenticateToken, rankRoutes);
app.use("/api/specializations", authenticateToken, specializationRoutes);
app.use("/api/trainees", authenticateToken, traineeRoutes);
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
app.use("/api/classes", authenticateToken, classRoutes);
app.use(
  "/api/class-time-schedules",
  authenticateToken,
  classTimeScheduleRoutes,
);
app.use("/api/class-reports", authenticateToken, classReportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Optional same-host SPA (not used on the split Vercel + Render demo)
if (process.env.SERVE_FRONTEND === "true") {
  const frontendDistPath = join(__dirname, "../frontend/dist");
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res) => {
    res.sendFile(join(frontendDistPath, "index.html"));
  });
}

// Connect to MongoDB

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));
});

module.exports = app;
