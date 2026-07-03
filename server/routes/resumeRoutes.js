const express =
require("express");

const multer =
require("multer");

const {
uploadResume,
getResume
}
=
require(
"../controllers/resumeController"
);

const router =
express.Router();
const auth = require("../middleware/auth");

const upload =
multer({
dest:"uploads/",
limits: { fileSize: 5 * 1024 * 1024 },
fileFilter: (_req, file, callback) => {
  if (file.mimetype !== "application/pdf") {
    return callback(new Error("Only PDF files are supported."));
  }
  callback(null, true);
},
});

router.post(
"/upload",
auth,
upload.single("resume"),
uploadResume
);

router.get("/", auth, getResume);

module.exports=
router; 
