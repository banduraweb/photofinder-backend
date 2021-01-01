/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
const { Types } = require("mongoose");
const errorTypes = require("../constants/errors");
const Keyword = require("../models/History");
const User = require("../models/User");
const SystemErrorService = require("./errors.service");
const Validation = require("./validation.service");
const { ObjectId } = Types;

class KeyWordService {
  static async addKeyword({ userId, keyword }) {
    const { error } = Validation.keyWordValidation({
      userId,
      keyword,
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
          { keyword: { $eq: keyword } },
          { usedBy: { $eq: ObjectId(userId) } },
        ],
      };

      const isExists = await Keyword.findOne(filter);
      if (isExists) {
        return this.KeywordUpdateCounter(userId, keyword);
      }
      const newKeyword = new Keyword({
        keyword,
        usedBy: ObjectId(userId),
        usedTimes: 1,
      });
      await newKeyword.save();
      return { message: "created" };
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }

  static async getKeywords(userId) {
    try {
      return await Keyword.find({ usedBy: { $eq: ObjectId(userId) } });
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
  static async KeywordUpdateCounter(userId, keyword) {
    try {
      const filter = {
        $and: [
          { keyword: { $eq: keyword } },
          { usedBy: { $eq: ObjectId(userId) } },
        ],
      };
      return await Keyword.update(filter, { $inc: { usedTimes: 1 } });
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
}

module.exports = KeyWordService;
