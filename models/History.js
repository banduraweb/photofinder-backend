const { Schema, model, Types } = require("mongoose");

const KeywordSchema = new Schema(
  {
    keyword: { type: String, required: false, unique: false },
    usedBy: { type: Types.ObjectId, ref: "User" },
    usedTimes: { type: Number, required: false, unique: false, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Keyword", KeywordSchema);
