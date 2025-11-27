const express = require("express");
const router = express.Router();
const authController = require("../app/controllers/authController.js");

router.get("/login", authController.loginPage);
router.post("/login", authController.login);
router.get("/signup", authController.signUpPage);
router.post("/signup", authController.signup);
router.post("/logout", authController.logout);
router.get("/forgot-password", authController.forgotPasswordPage);
router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password/:token", authController.resetPasswordPage);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
