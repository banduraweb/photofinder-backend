/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const errorTypes = require("../constants/errors");
const User = require("../models/User");
const Token = require("../models/Token");
const SystemErrorService = require("./errors.service");
const EmailService = require("./email.service");
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

      const token = await this.createToken(user);
      const refreshToken = await this.refreshToken(user);
      return { token, refreshToken };
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
  static async logout(refreshToken) {
    try {
      await Token.findOneAndDelete({ token: refreshToken });
      return { message: "User logged out!" };
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
  static async createToken(user) {
    try {
      const token = jwt.sign(
        {
          userId: user.id,
          app: "photofinder",
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          type: "access",
        },
        process.env.jwtKey,
        {
          expiresIn: "5m",
        }
      );
      return token;
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        return SystemErrorService.error("Token expired", errorTypes.Token);
      } else if (e instanceof jwt.JsonWebTokenError) {
        return SystemErrorService.error("Invalid token", errorTypes.Token);
      }
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
  static async refreshToken(user) {
    try {
      const refreshToken = jwt.sign(
        {
          userId: user.id,
          app: "photofinder",
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          type: "refresh",
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "24h",
        }
      );
      await new Token({ token: refreshToken }).save();
      return refreshToken;
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        return SystemErrorService.error("Token expired", errorTypes.Token);
      } else if (e instanceof jwt.JsonWebTokenError) {
        return SystemErrorService.error("Invalid token", errorTypes.Token);
      }
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
  static async generateRefreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        return SystemErrorService.error(
          "Access denied,token missing!",
          errorTypes.Token
        );
      } else {
        const tokenDoc = await Token.findOne({ token: refreshToken });
        if (!tokenDoc) {
          return SystemErrorService.error("Token expired!", errorTypes.Token);
        } else {
          const payload = jwt.verify(
            tokenDoc.token,
            process.env.REFRESH_TOKEN_SECRET
          );

          const { app, email, name, userId, createdAt, type } = payload;

          const token = jwt.sign(
            { app, email, name, userId, createdAt, type },
            process.env.jwtKey,
            {
              expiresIn: "5m",
            }
          );
          return { token };
        }
      }
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }

  static async forgotPassword(email, req) {
    try {
      const filter = {
        email: { $eq: email },
      };
      const user = await User.findOne(filter);
      if (!user) {
        return SystemErrorService.error(
          "User was not found",
          errorTypes.NotFound
        );
      }
      const token = await this.createToken(user);
      const link = `https://photofinder-lac.vercel.app/recoverpassword/${token}`;
      const msg = {
        to: email,
        from: "bandura.andriy.m@gmail.com",
        subject: "Forgot Password",
        text: "follow the instructions bellow",
        html: `
          <div>
           <h4>Dear ${user.name}</h4>
          <br/>
          <div style="color: #3140A1; font-size: 18px">Please click on given link for new password</div>
            <p style="color: seagreen">${link}</p>
          </div>
         `,
      };
      return EmailService.sendEmail(msg);
    } catch (e) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
  static async recoveryPassword(newPassword, confirmedNewPassword, token) {
    try {
      const decoded = jwt.verify(token, process.env.jwtKey);

      const { userId, email } = decoded;

      if (!userId || !email) {
        return SystemErrorService.error(
          "Validations errors",
          errorTypes.Validation
        );
      }

      const { error } = Validation.recoveryPasswordValidation({
        newPassword,
        confirmedNewPassword,
      });

      if (error) {
        return SystemErrorService.error(
          "Validations errors",
          errorTypes.Validation
        );
      }

      if (newPassword !== confirmedNewPassword) {
        return SystemErrorService.error(
          "Validations errors",
          errorTypes.Validation
        );
      }

      const filter = {
        $and: [{ _id: { $eq: userId } }, { email: { $eq: email } }],
      };

      const user = await User.findOne(filter);
      if (!user) {
        return SystemErrorService.error(
          "User was not found",
          errorTypes.NotFound
        );
      }
      const recoveredNewPassword = await bcrypt.hash(newPassword, 12);
      await User.update(filter, { $set: { password: recoveredNewPassword } });
      return {message: "Password has been changed successfully!"}
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        return SystemErrorService.error("Link time expired", errorTypes.Token);
      } else if (e instanceof jwt.JsonWebTokenError) {
        return SystemErrorService.error("Invalid link", errorTypes.Token);
      }
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
}

module.exports = UserService;
