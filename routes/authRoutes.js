const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getSecurityQuestion,
  resetPassword,
  deactivateAccount,
} = require("../controllers/authController");

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }
  next();
};

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", logout);

// Forgot password routes
router.post("/security-question", getSecurityQuestion);
router.post("/reset-password", resetPassword);

// Deactivate account route
router.delete("/deactivate", isAuthenticated, deactivateAccount);

module.exports = router;
