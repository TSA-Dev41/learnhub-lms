const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    points: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achievement", achievementSchema);
