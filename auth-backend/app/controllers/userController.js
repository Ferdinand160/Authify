const User = require("../models/User.js");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const getProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const id = req.session.user.user_id;
    const user = await User.findOne({ where: { user_id: id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      fullName: user.fullName,
      email: user.email,
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.session.user.user_id;
    const updatedFullName = req.body.fullName;
    const updatedEmail = req.body.email;
    if (
      validator.isEmpty(updatedFullName) ||
      !validator.isEmail(updatedEmail)
    ) {
      req.session.errorMessage =
        "All fields are required and email must be valid!";
      return res.json({ redirect: "/profile" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      req.session.errorMessage = "User not found!";
      return res.json({ redirect: "/login" });
    }
    const emailTaken = await User.findOne({
      where: {
        email: updatedEmail,
        user_id: { [Op.ne]: userId },
      },
    });

    if (emailTaken) {
      req.session.errorMessage =
        "Email already exists, please try another one!";
      return res.json({ redirect: "/profile" });
    }
    await user.update({
      fullName: updatedFullName,
      email: updatedEmail,
    });

    req.session.user.fullName = updatedFullName;
    req.session.user.email = updatedEmail;
    await req.session.save();

    return res.json({
      message: "Profile updated successfully",
      fullName: updatedFullName,
      email: updatedEmail,
    });
  } catch (err) {
    console.error("Updating Profile Error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const changePassword = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.session.user.user_id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    if (!oldPassword || !newPassword) {
      req.session.errorMessage = "Both old and new passwords are required!";
      return res.json({ redirect: "/profile" });
    }
    if (!validator.isLength(newPassword, { min: 6 })) {
      req.session.errorMessage = "Password must be at least 6 characters!";
      return res.json({ redirect: "/profile" });
    }

    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) {
      req.session.errorMessage = "User not found. Please log in again.";
      return res.json({ redirect: "/login" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      req.session.errorMessage = "Invalid old password!";
      return res.json({ redirect: "/profile" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 8);
    user.password = hashedNewPassword;
    await user.save();

    req.session.user.password = undefined;
    await req.session.save();

    return res.json({
      message: "Password updated successfully!",
      redirect: "/profile",
    });
  } catch (err) {
    console.error("Changing Password Error:", err);
    req.session.errorMessage = "Something went wrong. Please try again.";
    return res.status(500).json({ redirect: "/profile" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.session.user.user_id;

    const user = await User.findByPk(userId);
    if (!user) {
      req.session.errorMessage = "User not found!";
      return res.json({ redirect: "/profile" });
    }
    await user.destroy();

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session after account deletion:", err);
        return res
          .status(500)
          .json({ error: "Error logging out after deletion" });
      }
      return res.json({
        message: "Account deleted successfully",
        redirect: "/login",
      });
    });
  } catch (err) {
    console.error("Deleting account Error:", err);
    req.session.errorMessage = "Something went wrong. Please try again.";
    return res.json({ redirect: "/profile" });
  }
};

const fetchAllUsers = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.session.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const allUsers = await User.findAll({
      attributes: ["user_id", "fullName", "email", "createdAt", "updatedAt"],
    });
    return res.json({ users: allUsers });
  } catch (err) {
    console.error("Error fetching users:", err);
    req.session.errorMessage = "Something went wrong. Please try again.";
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  fetchAllUsers,
};
