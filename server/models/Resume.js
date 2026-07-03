const mongoose =
require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fileName: String,
    resumeText: String,
  },
  { timestamps: true }
);

module.exports=
mongoose.model(
"Resume",
resumeSchema
);
