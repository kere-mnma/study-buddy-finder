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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new student account
 *     description: Creates a user and an empty profile row. No authentication required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, course, password, security_question, security_answer]
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Ose Murphy
 *               email:
 *                 type: string
 *                 example: x00000000@student.ncirl.ie
 *               course:
 *                 type: string
 *                 example: Higher Diploma in Computing
 *               password:
 *                 type: string
 *                 format: password
 *                 example: hunter22
 *               security_question:
 *                 type: string
 *                 example: What was the name of your first pet?
 *               security_answer:
 *                 type: string
 *                 example: Rex
 *     responses:
 *       201:
 *         description: Registration successful.
 *       400:
 *         description: Missing/invalid fields, password too short, or email already registered.
 *       500:
 *         description: Server error.
 */
// Register route
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Log in and start a session
 *     description: On success, sets a session cookie used by every authenticated endpoint. No authentication required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: x00000000@student.ncirl.ie
 *               password:
 *                 type: string
 *                 format: password
 *                 example: hunter22
 *     responses:
 *       200:
 *         description: Login successful — returns the user's name and ID.
 *       400:
 *         description: Email and/or password missing.
 *       401:
 *         description: Invalid email or password.
 *       500:
 *         description: Server error.
 */
// Login route
router.post("/login", login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Log out and destroy the current session
 *     description: No authentication required — safe to call even without an active session.
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *       500:
 *         description: Logout failed (session could not be destroyed).
 */
// Logout route
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/security-question:
 *   post:
 *     tags: [Authentication]
 *     summary: Look up a user's security question by email
 *     description: First step of the forgot-password flow. No authentication required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: x00000000@student.ncirl.ie
 *     responses:
 *       200:
 *         description: Returns the account's security question.
 *       400:
 *         description: Email missing, or no matching account found.
 *       500:
 *         description: Server error.
 */
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset a password using the security answer
 *     description: Second step of the forgot-password flow. No authentication required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, security_answer, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 example: x00000000@student.ncirl.ie
 *               security_answer:
 *                 type: string
 *                 example: Rex
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newHunter23
 *     responses:
 *       200:
 *         description: Password reset successful.
 *       400:
 *         description: Missing fields, password too short, or security answer/email did not match.
 *       500:
 *         description: Server error.
 */
// Forgot password routes
router.post("/security-question", getSecurityQuestion);
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/deactivate:
 *   delete:
 *     tags: [Authentication]
 *     summary: Permanently delete the logged-in user's account
 *     description: Deletes the user's connections, profile, and user row, then destroys the session. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Deactivate account route
router.delete("/deactivate", isAuthenticated, deactivateAccount);

module.exports = router;
