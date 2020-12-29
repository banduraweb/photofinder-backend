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
}

module.exports = UserController;
