const { Schema, model, Types } = require("mongoose");

const PhotoSchema = new Schema(
  {
    photoId: { type: String, required: true, unique: false },
    url: { type: String, required: true, unique: false },
    user: { type: String, required: false, unique: false },
    tags: { type: String, required: false, unique: false },
    type: { type: String, required: false, unique: false },
    liked: { type: Boolean, required: false, unique: false },
    likedBy: { type: Types.ObjectId, ref: "User", unique: false },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Photo", PhotoSchema);
