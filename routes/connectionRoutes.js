const express = require("express");
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  declineRequest,
  getDashboard,
} = require("../controllers/connectionController");

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }
  next();
};

// Get dashboard data
router.get("/dashboard", isAuthenticated, getDashboard);

// Send a connection request
router.post("/request", isAuthenticated, sendRequest);

// Accept a connection request
router.put("/:id/accept", isAuthenticated, acceptRequest);

// Decline a connection request
router.put("/:id/decline", isAuthenticated, declineRequest);

module.exports = router;
