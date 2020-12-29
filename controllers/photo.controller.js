const PhotoService = require("../services/photo.service");
const Response = require("../helpers/defaultResponse");

class UserController {
  static async crudPhoto(req, res) {
    const { userId } = req.user;
    const { photoId, url } = req.body;
    const response = await PhotoService.crudPhoto({
      ...req.body,
      userId,
      photoId,
      url,
    });
    Response.defaultResponse(res, 200, response);
  }

  static async getMyList(req, res) {
    const { userId } = req.user;
    const response = await PhotoService.getMyList(userId);
    Response.defaultResponse(res, 200, response);
  }
}

module.exports = UserController;
