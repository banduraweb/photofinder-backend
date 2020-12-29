/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
const { Types } = require("mongoose");
const errorTypes = require("../constants/errors");
const Photo = require("../models/Photo");
const SystemErrorService = require("./errors.service");
const Validation = require("./validation.service");
const { ObjectId } = Types;
class PhotoService {
  static async crudPhoto({ userId, photoId, url, user, tags, type, liked }) {
    const { error } = Validation.photoValidation({
      userId,
      photoId,
      url,
    });

    if (error) {
      return SystemErrorService.error(
        "Validations errors",
        errorTypes.Validation
      );
    }

    try {
      const filter = {
        $and: [
          { photoId: { $eq: photoId } },
          { likedBy: { $eq: ObjectId(userId) } },
        ],
      };

      const isExists = await Photo.findOne(filter);
      if (isExists) {
        return this.dislikePhoto(filter);
      }
      const photo = new Photo({
        photoId,
        url,
        likedBy: userId,
        user,
        tags,
        type,
        liked,
      });
      await photo.save();
      return { message: "created" };
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
  static async dislikePhoto(filter) {
    return await Photo.findOneAndRemove(filter);
  }

  static async getMyList(userId) {
    return await Photo.find({ likedBy: { $eq: ObjectId(userId) } });
  }
}

module.exports = PhotoService;
