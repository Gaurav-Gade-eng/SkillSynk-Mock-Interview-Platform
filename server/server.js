const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

app.use("/api/auth",
require("./routes/authRoutes"));

app.use("/api/resume",
require("./routes/resumeRoutes"));

app.use("/api/interview",
require("./routes/interviewRoutes"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SkillSync API" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ message: err.message || "Something went wrong." });
});

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`SkillSync API running on port ${port}`);
  });
});
