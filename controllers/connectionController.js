const db = require("../config/db");

// Send a connection request
const sendRequest = (req, res) => {
  const senderId = req.session.userId;
  const { receiverId } = req.body;

  if (!senderId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  // Check for duplicate request
  const checkDuplicate =
    'SELECT * FROM connections WHERE sender_id = ? AND receiver_id = ? AND status = "pending"';
  db.query(checkDuplicate, [senderId, receiverId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already sent a request to this student." });
    }

    // Insert connection request
    const insertRequest =
      "INSERT INTO connections (sender_id, receiver_id) VALUES (?, ?)";
    db.query(insertRequest, [senderId, receiverId], (err) => {
      if (err) return res.status(500).json({ message: "Server error" });

      return res.status(201).json({ message: "Study request sent." });
    });
  });
};

// Accept a connection request
const acceptRequest = (req, res) => {
  const userId = req.session.userId;
  const connectionId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  const query =
    'UPDATE connections SET status = "accepted" WHERE id = ? AND receiver_id = ?';
  db.query(query, [connectionId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    return res.status(200).json({ message: "Connection accepted." });
  });
};

// Decline a connection request
const declineRequest = (req, res) => {
  const userId = req.session.userId;
  const connectionId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  const query =
    'UPDATE connections SET status = "declined" WHERE id = ? AND receiver_id = ?';
  db.query(query, [connectionId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    return res.status(200).json({ message: "Connection declined." });
  });
};

// Get dashboard data — confirmed buddies and pending requests
const getDashboard = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  // Get pending incoming requests
  const pendingQuery = `
    SELECT connections.id, users.full_name, users.course, profiles.modules
    FROM connections
    JOIN users ON connections.sender_id = users.id
    JOIN profiles ON users.id = profiles.user_id
    WHERE connections.receiver_id = ? AND connections.status = "pending"
  `;

  // Get confirmed buddies
  const confirmedQuery = `
    SELECT users.id, users.full_name, users.course, profiles.modules, profiles.study_location
    FROM connections
    JOIN users ON (
      CASE
        WHEN connections.sender_id = ? THEN connections.receiver_id = users.id
        ELSE connections.sender_id = users.id
      END
    )
    JOIN profiles ON users.id = profiles.user_id
    WHERE (connections.sender_id = ? OR connections.receiver_id = ?)
    AND connections.status = "accepted"
  `;

  db.query(pendingQuery, [userId], (err, pending) => {
    if (err) return res.status(500).json({ message: "Server error" });

    db.query(confirmedQuery, [userId, userId, userId], (err, confirmed) => {
      if (err) return res.status(500).json({ message: "Server error" });

      return res.status(200).json({ pending, confirmed });
    });
  });
};

module.exports = { sendRequest, acceptRequest, declineRequest, getDashboard };
