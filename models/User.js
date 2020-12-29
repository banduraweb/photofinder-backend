const { Schema, model, Types } = require("mongoose");

const userSchema = new Schema(
  {
    name: { type: String, required: true, unique: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    history: [{ type: Types.ObjectId, ref: "Keyword", unique: false }],
    liked: [{ type: Types.ObjectId, ref: "Photo", unique: false }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
