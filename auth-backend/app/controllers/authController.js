const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const loginPage = (req, res) => {
  if (req.session.isLoggedIn) {
    return res.json({ redirect: "/home" });
  }

  const errorMessage = req.session.errorMessage || null;
  const oldInput = req.session.oldInput || {};

  req.session.errorMessage = null;
  req.session.oldInput = null;

  res.json({ page: "login", errorMessage, oldInput });
};

const signUpPage = (req, res) => {
  if (req.session.isLoggedIn) {
    return res.json({ redirect: "/home" });
  }

  const errorMessage = req.session.errorMessage || null;
  const oldInput = req.session.oldInput || {};

  req.session.errorMessage = null;
  req.session.oldInput = null;

  res.json({ page: "signup", errorMessage, oldInput });
};

const forgotPasswordPage = (req, res) => {
  if (req.session.isLoggedIn) {
    return res.json({ redirect: "/home" });
  }

  const errorMessage = req.session.errorMessage || null;
  const oldInput = req.session.oldInput || {};

  req.session.errorMessage = null;
  req.session.oldInput = null;

  res.json({ page: "forgot-password", errorMessage, oldInput });
};

const resetPasswordPage = (req, res) => {
  if (req.session.isLoggedIn) {
    return res.json({ redirect: "/home" });
  }

  const errorMessage = req.session.errorMessage || null;
  const oldInput = req.session.oldInput || {};

  req.session.errorMessage = null;
  req.session.oldInput = null;

  res.json({ page: "reset-password", errorMessage, oldInput });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email) || validator.isEmpty(password)) {
      req.session.errorMessage = "Please enter a valid email and password";
      req.session.oldInput = { email };
      return res.json({ redirect: "/login" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      req.session.errorMessage = "No user found";
      req.session.oldInput = { email };
      return res.json({ redirect: "/login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.session.errorMessage = "Incorrect password";
      req.session.oldInput = { email };
      return res.json({ redirect: "/login" });
    }

    req.session.isLoggedIn = true;
    req.session.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    };

    await req.session.save();
    return res.json({ redirect: "/home" });
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Something went wrong, please try again";
    return res.json({ redirect: "/login" });
  }
};

const signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (
      !validator.isEmail(email) ||
      validator.isEmpty(password) ||
      validator.isEmpty(fullName)
    ) {
      req.session.errorMessage = "All fields are required!";
      req.session.oldInput = { email, fullName };
      return res.json({ redirect: "/signup" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      req.session.errorMessage = "Email already exists, please login";
      req.session.oldInput = { email };
      return res.json({ redirect: "/login" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    return res.json({ redirect: "/login" });
  } catch (err) {
    console.error("Signup Error:", err);
    req.session.errorMessage = "Something went wrong";
    return res.json({ redirect: "/signup" });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Error logging out");
      }
      return res.json({ redirect: "/login" });
    });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.json({ redirect: "/login" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    if (!validator.isEmail(email)) {
      req.session.errorMessage = "Please enter a valid email";
      return res.json({ redirect: "/forgot-password" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      req.session.errorMessage = "No user found with that email";
      req.session.oldInput = { email };
      return res.json({ redirect: "/forgot-password" });
    }

    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link is valid for 1 hour.</p>
      `,
    });

    return res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Something went wrong";
    return res.json({ redirect: "/forgot-password" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const newPassword = req.body.password;

    if (!newPassword || newPassword.length < 6) {
      req.session.errorMessage = "Password must be at least 6 characters";
      return res.json({ redirect: `/reset-password/${token}` });
    }

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      req.session.errorMessage = "Reset link invalid or expired";
      return res.json({ redirect: "/forgot-password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 8);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.json({
      message: "Password updated successfully",
      redirect: "/login",
    });
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Something went wrong";
    return res.json({ redirect: "/forgot-password" });
  }
};

module.exports = {
  loginPage,
  signUpPage,
  forgotPasswordPage,
  resetPasswordPage,
  login,
  signup,
  logout,
  forgotPassword,
  resetPassword,
};
