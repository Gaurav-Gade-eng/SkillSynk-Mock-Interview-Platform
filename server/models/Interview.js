const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    technical: { type: Number, default: 0, min: 0, max: 10 },
    communication: { type: Number, default: 0, min: 0, max: 10 },
    confidence: { type: Number, default: 0, min: 0, max: 10 },
    strengths: { type: String, default: "" },
    weaknesses: { type: String, default: "" },
    feedback: { type: String, default: "" },
    improvedAnswer: { type: String, default: "" },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    domain: { type: String, required: true, trim: true },
    role: { type: String, default: "Software Engineer", trim: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    duration: { type: Number, default: 0 },
    questions: [{ type: String }],
    answers: [answerSchema],
    score: { type: Number, default: 0, min: 0, max: 10 },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
