const express = require("express");
const router = express.Router();
const {
  proposeSession,
  respondSession,
  getMySessions,
} = require("../controllers/sessionController");

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }
  next();
};

// Propose a study session with a confirmed buddy
router.post("/propose", isAuthenticated, proposeSession);

// Confirm or decline a proposed study session
router.put("/:id/respond", isAuthenticated, respondSession);

// Get all study sessions involving the logged-in user
router.get("/mine", isAuthenticated, getMySessions);

module.exports = router;
