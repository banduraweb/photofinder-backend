const UserService = require("../services/user.service");
const Response = require("../helpers/defaultResponse");

class UserController {
  static async registration(req, res) {
    const { name, email, password } = req.body;
    const response = await UserService.registration(name, email, password);
    Response.defaultResponse(res, 200, response);
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const response = await UserService.login(email, password);
    Response.defaultResponse(res, 200, response);
  }
  static async resetPassword(req, res) {
    const { userId, email } = req.user;
    const { password, oldpassword } = req.body;
    const response = await UserService.resetPassword(
      userId,
      email,
      password,
      oldpassword
    );
    Response.defaultResponse(res, 200, response);
  }
  static async generateRefreshToken(req, res) {
    const { refreshToken } = req.body;
    const response = await UserService.generateRefreshToken(
      refreshToken
    );
    Response.defaultResponse(res, 200, response);
  }
  static async logout(req, res) {
    const { id } = req.params;
    const response = await UserService.logout(
      id
    );
    Response.defaultResponse(res, 200, response);
  }
}

module.exports = UserController;
