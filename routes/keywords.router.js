const express = require("express");
const auth = require("../middlewares/auth.middleware");
const router = express.Router();
const KeywordController = require("../controllers/keywords.controller");

router.post("/addkeyword", auth, KeywordController.addKeyword);
router.get("/getmykeword", auth, KeywordController.getKeywords);

module.exports = router;
