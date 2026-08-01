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

/**
 * @swagger
 * /api/profile/search:
 *   get:
 *     tags: [Profile]
 *     summary: Search for study buddies by keyword
 *     description: Matches the keyword against course name or modules. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         example: Databases
 *       - in: query
 *         name: location
 *         required: false
 *         schema:
 *           type: string
 *           enum: [all, online, on-campus, both]
 *         example: online
 *     responses:
 *       200:
 *         description: Matching students (results may be an empty array).
 *       400:
 *         description: No search keyword provided.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Search for study buddies — must come BEFORE /:id route
router.get("/search", isAuthenticated, searchBuddies);

/**
 * @swagger
 * /api/profile/browse-all:
 *   get:
 *     tags: [Profile]
 *     summary: Browse all other students, paginated
 *     description: Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         example: 10
 *     responses:
 *       200:
 *         description: A page of students, plus total and totalPages.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Browse all students, paginated — must come BEFORE /:id route
router.get("/browse-all", isAuthenticated, browseAll);

/**
 * @swagger
 * /api/profile/update:
 *   put:
 *     tags: [Profile]
 *     summary: Update the logged-in user's profile
 *     description: Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [course, modules]
 *             properties:
 *               course:
 *                 type: string
 *                 example: Higher Diploma in Computing
 *               modules:
 *                 type: string
 *                 example: Web Development, Databases, Project
 *               study_location:
 *                 type: string
 *                 enum: [both, online, on-campus]
 *                 example: both
 *               bio:
 *                 type: string
 *                 example: Second-year student looking for a Databases study partner.
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Course or modules missing.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Update logged in user's profile
router.put("/update", isAuthenticated, updateProfile);

/**
 * @swagger
 * /api/profile/upload-picture:
 *   post:
 *     tags: [Profile]
 *     summary: Upload a profile picture
 *     description: JPG or PNG only, max 2MB. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [profile_picture]
 *             properties:
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload successful — returns the new profile_picture path.
 *       400:
 *         description: No file provided, wrong file type, or file too large.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Upload a profile picture
router.post("/upload-picture", isAuthenticated, uploadPicture);

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     tags: [Profile]
 *     summary: Get a student's profile by user ID
 *     description: Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 7
 *     responses:
 *       200:
 *         description: The requested profile.
 *       401:
 *         description: Not logged in.
 *       404:
 *         description: Profile not found.
 *       500:
 *         description: Server error.
 */
// Get a profile by user ID
router.get("/:id", isAuthenticated, getProfile);

module.exports = router;
