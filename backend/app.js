const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/king-khalid-training";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const shiftRoutes = require("./routes/shifts");
const rankRoutes = require("./routes/ranks");
const specializationRoutes = require("./routes/specializations");
app.use("/api/shifts", shiftRoutes);
app.use("/api/ranks", rankRoutes);
app.use("/api/specializations", specializationRoutes);

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
