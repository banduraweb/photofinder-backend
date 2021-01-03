const express = require("express");

const router = express.Router();
const UserController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/register", UserController.registration);
router.post("/login", UserController.login);
router.post("/resetpassword", auth, UserController.resetPassword);
router.post("/refreshtoken", UserController.generateRefreshToken);
router.delete("/logout/:id", UserController.logout);

module.exports = router;
