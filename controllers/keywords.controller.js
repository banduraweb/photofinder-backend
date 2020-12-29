const KeyWordService = require("../services/keyword.service");
const Response = require("../helpers/defaultResponse");

class KeywordController {
  static async addKeyword(req, res) {
    const { userId } = req.user;
    const { keyword } = req.body;
    const response = await KeyWordService.addKeyword({ userId, keyword });
    Response.defaultResponse(res, 200, response);
  }

  static async getKeywords(req, res) {
    const { userId } = req.user;
    const response = await KeyWordService.getKeywords(userId);
    Response.defaultResponse(res, 200, response);
  }
}

module.exports = KeywordController;
