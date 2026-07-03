const pdfParse = require("pdf-parse");
const fs = require("fs");

const Resume = require("../models/Resume");

exports.uploadResume = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "Please select a PDF résumé." });
    }

    const dataBuffer = fs.readFileSync(req.file.path);

    const pdfData = await pdfParse(dataBuffer);

    const resumeText = pdfData.text;

    await Resume.findOneAndUpdate(
      { userId: req.user._id },
      { userId: req.user._id, resumeText, fileName: req.file.originalname },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    fs.unlink(req.file.path, () => {});

    res.json({
      message: "Résumé uploaded and ready for personalized interviews.",
      fileName: req.file.originalname,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};

exports.getResume = async (req, res) => {
  const resume = await Resume.findOne({ userId: req.user._id }).select(
    "fileName updatedAt"
  );
  res.json({ resume });
};
