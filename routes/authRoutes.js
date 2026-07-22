const express = require("express");
const router = express.Router();
const { register, login, logout, getSecurityQuestion, resetPassword } = require("../controllers/authController");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", logout);

// Forgot password routes
router.post("/security-question", getSecurityQuestion);
router.post("/reset-password", resetPassword);

module.exports = router;
