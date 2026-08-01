const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }
  next();
};

// Get the logged-in user's settings
router.get("/", isAuthenticated, getSettings);

// Update the logged-in user's settings
router.put("/", isAuthenticated, updateSettings);

module.exports = router;
