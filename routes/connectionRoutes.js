const express = require("express");
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  declineRequest,
  getDashboard,
  withdrawRequest,
  getAnalytics,
} = require("../controllers/connectionController");

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }
  next();
};

/**
 * @swagger
 * /api/connections/dashboard:
 *   get:
 *     tags: [Connections]
 *     summary: Get Home page dashboard data
 *     description: Returns the logged-in user's pending incoming requests, pending sent requests, and confirmed buddies. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Object with pending, sent, and confirmed arrays.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Get dashboard data
router.get("/dashboard", isAuthenticated, getDashboard);

/**
 * @swagger
 * /api/connections/analytics:
 *   get:
 *     tags: [Connections]
 *     summary: Get connection-based analytics
 *     description: Counts of confirmed buddies, requests sent, and requests received. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Object with confirmedBuddies, requestsSent, and requestsReceived counts.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Get connection-based analytics
router.get("/analytics", isAuthenticated, getAnalytics);

/**
 * @swagger
 * /api/connections/request:
 *   post:
 *     tags: [Connections]
 *     summary: Send a study buddy connection request
 *     description: Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverId]
 *             properties:
 *               receiverId:
 *                 type: integer
 *                 example: 12
 *     responses:
 *       201:
 *         description: Study request sent.
 *       400:
 *         description: Receiver missing, or a pending request already exists between these users.
 *       401:
 *         description: Not logged in.
 *       500:
 *         description: Server error.
 */
// Send a connection request
router.post("/request", isAuthenticated, sendRequest);

/**
 * @swagger
 * /api/connections/{id}/accept:
 *   put:
 *     tags: [Connections]
 *     summary: Accept a pending connection request
 *     description: Only the receiver of the request may accept it. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Connection accepted.
 *       401:
 *         description: Not logged in.
 *       404:
 *         description: Connection request not found.
 *       500:
 *         description: Server error.
 */
// Accept a connection request
router.put("/:id/accept", isAuthenticated, acceptRequest);

/**
 * @swagger
 * /api/connections/{id}/decline:
 *   put:
 *     tags: [Connections]
 *     summary: Decline a pending connection request
 *     description: Only the receiver of the request may decline it. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Connection declined.
 *       401:
 *         description: Not logged in.
 *       404:
 *         description: Connection request not found.
 *       500:
 *         description: Server error.
 */
// Decline a connection request
router.put("/:id/decline", isAuthenticated, declineRequest);

/**
 * @swagger
 * /api/connections/{id}/withdraw:
 *   delete:
 *     tags: [Connections]
 *     summary: Withdraw a sent connection request
 *     description: Only the original sender may withdraw a still-pending request. Requires an active session cookie.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Request withdrawn.
 *       401:
 *         description: Not logged in.
 *       404:
 *         description: Connection request not found.
 *       500:
 *         description: Server error.
 */
// Withdraw a sent connection request
router.delete("/:id/withdraw", isAuthenticated, withdrawRequest);

module.exports = router;
