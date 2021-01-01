/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const errorTypes = require("../constants/errors");
const User = require("../models/User");
const SystemErrorService = require("./errors.service");
const Validation = require("./validation.service");
require("dotenv").config();
class UserService {
  static async registration(name, email, password) {
    const { error } = Validation.registrationValidation({
      name,
      email,
      password,
    });

    if (error) {
      return SystemErrorService.error(
        "Validations errors",
        errorTypes.Validation
      );
    }

    try {
      const isExists = await User.findOne({ email });
      if (isExists) {
        return SystemErrorService.error(
          "An user with this email already existed",
          errorTypes.Validation
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
      return { message: "created" };
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }

  static async login(email, password) {
    const { error } = Validation.loginValidation({ email, password });

    if (error) {
      return SystemErrorService.error(
        "Validations errors",
        errorTypes.Validation
      );
    }

    try {
      const isExists = await User.findOne({ email });
      if (!isExists) {
        return SystemErrorService.error(
          "User was not found",
          errorTypes.NotFound
        );
      }

      const user = await User.findOne({ email });

      const isMatchedPassword = await bcrypt.compare(password, user.password);

      if (!isMatchedPassword) {
        return SystemErrorService.error(
          "Not correct password",
          errorTypes.Validation
        );
      }

      const token = jwt.sign(
        {
          userId: user.id,
          app: "photofinder",
          name: user.name,
          email,
          createdAt: user.createdAt,
        },
        process.env.jwtKey,
        {
          expiresIn: "24h",
        }
      );

      return { token, userId: user._id };
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
  static async resetPassword(userId, email, password, oldpassword) {
    const { error } = Validation.resetPasswordValidation({
      email,
      password,
      oldpassword,
    });

    if (error) {
      return SystemErrorService.error(
        "Validations errors",
        errorTypes.Validation
      );
    }

    try {
      const filter = {
        $and: [{ _id: { $eq: userId } }, { email: { $eq: email } }],
      };
      const isExists = await User.findOne(filter);
      if (!isExists) {
        return SystemErrorService.error(
          "User was not found",
          errorTypes.NotFound
        );
      }
      const isMatchedPassword = await bcrypt.compare(
        oldpassword,
        isExists.password
      );
      if (isMatchedPassword) {
        const newPassword = await bcrypt.hash(password, 12);
        await User.update(filter, { $set: { password: newPassword } });
        return { message: "password changed successfully!" };
      } else {
        return SystemErrorService.error(
          "Wrong old password",
          errorTypes.Forbidden
        );
      }
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
}

module.exports = UserService;
