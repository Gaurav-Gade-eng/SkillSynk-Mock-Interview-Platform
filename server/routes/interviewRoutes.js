const express = require("express");
const router = express.Router();

const {
  generateQuestions,
  evaluateAnswer,
  completeInterview,
  getInterview,
  getDashboard,
} = require("../controllers/interviewController");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/dashboard", getDashboard);
router.get("/:id", getInterview);
router.post("/generate", generateQuestions);
router.post("/evaluate", evaluateAnswer);
router.post("/:id/complete", completeInterview);

module.exports = router;
