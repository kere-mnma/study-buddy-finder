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

/**
 * @swagger
 * /api/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get the logged-in user's settings
 *     description: Creates a default settings row on first access. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Object with theme, push_notifications, email_notifications, sound_effects.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 *   put:
 *     tags: [Settings]
 *     summary: Save the logged-in user's settings
 *     description: Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [theme]
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, system]
 *                 example: dark
 *               push_notifications:
 *                 type: boolean
 *                 example: true
 *               email_notifications:
 *                 type: boolean
 *                 example: true
 *               sound_effects:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Settings saved.
 *       400:
 *         description: Invalid theme selection.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Get the logged-in user's settings
router.get("/", isAuthenticated, getSettings);

// Update the logged-in user's settings
router.put("/", isAuthenticated, updateSettings);

module.exports = router;
