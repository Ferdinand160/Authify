const express = require("express");
const router = express.Router();
const userController = require("../app/controllers/userController.js");
const { isAuthenticated, isAdmin } = require("../app/middlewares/auth.js");

router.get("/profile", isAuthenticated, userController.getProfile);
router.put("/profile", isAuthenticated, userController.updateProfile);
router.put("/profile/password", isAuthenticated, userController.changePassword);
router.delete("/profile", isAuthenticated, userController.deleteAccount);
router.get("/all", isAuthenticated, isAdmin, userController.fetchAllUsers);

module.exports = router;
