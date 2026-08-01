const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  searchBuddies,
  browseAll,
  uploadPicture,
} = require("../controllers/profileController");

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }
  next();
};

// Search for study buddies — must come BEFORE /:id route
router.get("/search", isAuthenticated, searchBuddies);

// Browse all students, paginated — must come BEFORE /:id route
router.get("/browse-all", isAuthenticated, browseAll);

// Update logged in user's profile
router.put("/update", isAuthenticated, updateProfile);

// Upload a profile picture
router.post("/upload-picture", isAuthenticated, uploadPicture);

// Get a profile by user ID
router.get("/:id", isAuthenticated, getProfile);

module.exports = router;
