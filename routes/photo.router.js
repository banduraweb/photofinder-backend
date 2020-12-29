const express = require("express");
const auth = require("../middlewares/auth.middleware");
const router = express.Router();
const PhotoController = require("../controllers/photo.controller");

router.post("/make", auth, PhotoController.crudPhoto);
router.get("/likedlist", auth, PhotoController.getMyList);

module.exports = router;
