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

/**
 * @swagger
 * /api/sessions/propose:
 *   post:
 *     tags: [Sessions]
 *     summary: Propose a study session with a confirmed buddy
 *     description: The connection must exist, be accepted, and involve the logged-in user. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [connectionId, session_date, session_time, location]
 *             properties:
 *               connectionId:
 *                 type: integer
 *                 example: 3
 *               session_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-10"
 *               session_time:
 *                 type: string
 *                 example: "14:30"
 *               location:
 *                 type: string
 *                 example: Library, 2nd floor
 *     responses:
 *       201:
 *         description: Study session proposed.
 *       400:
 *         description: Connection, date, time, or location missing.
 *       401:
 *         description: Not logged in.
 *       404:
 *         description: Confirmed study buddy connection not found.
 *       500:
 *         description: Server error.
 */
// Propose a study session with a confirmed buddy
router.post("/propose", isAuthenticated, proposeSession);

/**
 * @swagger
 * /api/sessions/{id}/respond:
 *   put:
 *     tags: [Sessions]
 *     summary: Confirm or decline a proposed study session
 *     description: Only the buddy who did NOT propose the session may respond. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [confirm, decline]
 *                 example: confirm
 *     responses:
 *       200:
 *         description: Study session confirmed or declined.
 *       400:
 *         description: Invalid action (must be "confirm" or "decline").
 *       401:
 *         description: Not logged in.
 *       404:
 *         description: Study session not found, already responded to, or proposed by the caller.
 *       500:
 *         description: Server error.
 */
// Confirm or decline a proposed study session
router.put("/:id/respond", isAuthenticated, respondSession);

/**
 * @swagger
 * /api/sessions/mine:
 *   get:
 *     tags: [Sessions]
 *     summary: Get all study sessions involving the logged-in user
 *     description: Includes both "proposed" and "confirmed" sessions. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Array of study sessions.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Get all study sessions involving the logged-in user
router.get("/mine", isAuthenticated, getMySessions);

module.exports = router;
