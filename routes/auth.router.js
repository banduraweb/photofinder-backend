const express = require("express");

const router = express.Router();
const UserController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/register", UserController.registration);
router.post("/login", UserController.login);
router.post("/resetpassword", auth, UserController.resetPassword);

module.exports = router;
