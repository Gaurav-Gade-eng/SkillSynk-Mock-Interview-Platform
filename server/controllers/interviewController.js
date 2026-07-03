const groq = require("../config/groq");
const Resume = require("../models/Resume");
const Interview = require("../models/Interview");

const cleanJson = (value) =>
  value.replace(/```json/gi, "").replace(/```/g, "").trim();

const clampScore = (value) => Math.max(0, Math.min(10, Number(value) || 0));

const fallbackQuestions = (domain, role) => [
  `Walk me through your experience that is most relevant to a ${role} position.`,
  `What are the most important fundamentals someone working with ${domain} should understand?`,
  `Describe a difficult ${domain} problem you solved and how you approached it.`,
  `How would you design a production-ready application using ${domain}?`,
  `What trade-offs would you consider when improving performance and scalability?`,
  `Tell me about a technical decision you disagreed with and how you handled it.`,
  `How do you test, monitor, and debug your work in production?`,
  `Explain a core ${domain} concept as if you were mentoring a junior engineer.`,
];

exports.generateQuestions = async (req, res) => {
  try {
    const {
      domain,
      role = "Software Engineer",
      difficulty = "Intermediate",
      questionCount = 8,
    } = req.body;

    if (!domain?.trim()) {
      return res.status(400).json({ message: "Please select an interview domain." });
    }

    const count = Math.max(5, Math.min(10, Number(questionCount) || 8));
    const resume = await Resume.findOne({ userId: req.user._id });
    const resumeContext = resume?.resumeText?.slice(0, 12000) || "";

    let questions;
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a senior interviewer. Return valid JSON only, with a questions array. Every item must contain question and category.",
          },
          {
            role: "user",
            content: `Create ${count} realistic ${difficulty} interview questions for a ${role} candidate in ${domain}.
Balance technical fundamentals, practical scenarios, system thinking, and behavioral judgment.
${resumeContext ? `Personalize several questions using this résumé:\n${resumeContext}` : ""}
Do not include answers. Use this exact shape:
{"questions":[{"question":"...","category":"Technical"}]}`,
          },
        ],
      });

      const parsed = JSON.parse(cleanJson(completion.choices[0].message.content));
      questions = (parsed.questions || parsed)
        .map((item) =>
          typeof item === "string"
            ? { question: item, category: "Technical" }
            : { question: item.question, category: item.category || "Technical" }
        )
        .filter((item) => item.question)
        .slice(0, count);
    } catch (aiError) {
      console.error("Question generation fallback:", aiError.message);
      questions = fallbackQuestions(domain, role)
        .slice(0, count)
        .map((question, index) => ({
          question,
          category: index === 0 || index === 5 ? "Behavioral" : "Technical",
        }));
    }

    const interview = await Interview.create({
      userId: req.user._id,
      domain,
      role,
      difficulty,
      questions: questions.map((item) => item.question),
    });

    res.status(201).json({
      interviewId: interview._id,
      questions,
      personalized: Boolean(resumeContext),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to create interview." });
  }
};

exports.evaluateAnswer = async (req, res) => {
  try {
    const { interviewId, question, answer } = req.body;

    if (!question || !answer?.trim()) {
      return res.status(400).json({ message: "A spoken or typed answer is required." });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
      status: "in-progress",
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    let result;
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.25,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a fair senior interviewer. Return valid JSON only. Score evidence, clarity, structure, and relevance; do not infer confidence from accent or identity.",
          },
          {
            role: "user",
            content: `Question: ${question}
Candidate answer: ${answer}

Return:
{"technical":0-10,"communication":0-10,"confidence":0-10,"strengths":"specific concise text","weaknesses":"specific concise text","feedback":"actionable coaching in 2-3 sentences","improvedAnswer":"a concise stronger example answer"}`,
          },
        ],
      });
      result = JSON.parse(cleanJson(completion.choices[0].message.content));
    } catch (aiError) {
      console.error("Evaluation fallback:", aiError.message);
      const wordCount = answer.trim().split(/\s+/).length;
      const base = wordCount > 45 ? 7 : wordCount > 20 ? 6 : 5;
      result = {
        technical: base,
        communication: Math.min(8, base + 1),
        confidence: base,
        strengths: "You addressed the question directly and provided a clear starting point.",
        weaknesses: "Add a concrete example, trade-off, and measurable outcome.",
        feedback: "Structure the answer as context, action, reasoning, and result. Then close with what you learned.",
        improvedAnswer: "Use a specific project example, explain your decision, discuss alternatives, and quantify the outcome.",
      };
    }

    const evaluation = {
      question,
      answer: answer.trim(),
      technical: clampScore(result.technical),
      communication: clampScore(result.communication),
      confidence: clampScore(result.confidence),
      strengths: result.strengths || "",
      weaknesses: result.weaknesses || "",
      feedback: result.feedback || "",
      improvedAnswer: result.improvedAnswer || "",
    };

    interview.answers.push(evaluation);
    await interview.save();
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to evaluate answer." });
  }
};

exports.completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }
    if (!interview.answers.length) {
      return res.status(400).json({ message: "Answer at least one question first." });
    }

    const totals = interview.answers.reduce(
      (sum, item) => ({
        technical: sum.technical + item.technical,
        communication: sum.communication + item.communication,
        confidence: sum.confidence + item.confidence,
      }),
      { technical: 0, communication: 0, confidence: 0 }
    );
    const divisor = interview.answers.length;
    const averages = {
      technical: Number((totals.technical / divisor).toFixed(1)),
      communication: Number((totals.communication / divisor).toFixed(1)),
      confidence: Number((totals.confidence / divisor).toFixed(1)),
    };

    interview.score = Number(
      ((averages.technical + averages.communication + averages.confidence) / 3).toFixed(1)
    );
    interview.duration = Math.max(0, Number(req.body.duration) || 0);
    interview.status = "completed";
    interview.completedAt = new Date();
    await interview.save();

    res.json({ interview, averages });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to complete interview." });
  }
};

exports.getInterview = async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!interview) {
    return res.status(404).json({ message: "Interview not found." });
  }
  res.json({ interview });
};

exports.getDashboard = async (req, res) => {
  const interviews = await Interview.find({
    userId: req.user._id,
    status: "completed",
  })
    .sort({ completedAt: -1 })
    .limit(12)
    .lean();

  const total = interviews.length;
  const averageScore = total
    ? Number((interviews.reduce((sum, item) => sum + item.score, 0) / total).toFixed(1))
    : 0;
  const bestScore = total ? Math.max(...interviews.map((item) => item.score)) : 0;
  const practiceMinutes = Math.round(
    interviews.reduce((sum, item) => sum + (item.duration || 0), 0) / 60
  );

  res.json({
    stats: { total, averageScore, bestScore, practiceMinutes },
    recent: interviews.slice(0, 5),
  });
};
