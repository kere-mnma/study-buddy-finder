const db = require("../config/db");

// Propose a study session with a confirmed buddy
const proposeSession = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  const { connectionId, session_date, session_time, location } = req.body;

  if (!connectionId || !session_date || !session_time || !location) {
    return res
      .status(400)
      .json({ message: "Connection, date, time, and location are required." });
  }

  // Confirm the connection exists, is accepted, and involves the logged-in user
  const checkConnection =
    'SELECT * FROM connections WHERE id = ? AND status = "accepted" AND (sender_id = ? OR receiver_id = ?)';
  db.query(checkConnection, [connectionId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Confirmed study buddy connection not found." });
    }

    const insertSession =
      'INSERT INTO study_sessions (connection_id, proposed_by, session_date, session_time, location, status) VALUES (?, ?, ?, ?, ?, "proposed")';
    db.query(
      insertSession,
      [connectionId, userId, session_date, session_time, location],
      (err) => {
        if (err) return res.status(500).json({ message: "Server error" });

        return res.status(201).json({ message: "Study session proposed." });
      },
    );
  });
};

// Confirm or decline a proposed study session — only the non-proposer can respond
const respondSession = (req, res) => {
  const userId = req.session.userId;
  const sessionId = req.params.id;
  const { action } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  if (action !== "confirm" && action !== "decline") {
    return res.status(400).json({ message: "Invalid action." });
  }

  const newStatus = action === "confirm" ? "confirmed" : "declined";

  const checkSession = `
    SELECT study_sessions.id, study_sessions.proposed_by
    FROM study_sessions
    JOIN connections ON study_sessions.connection_id = connections.id
    WHERE study_sessions.id = ?
    AND study_sessions.status = "proposed"
    AND study_sessions.proposed_by != ?
    AND (connections.sender_id = ? OR connections.receiver_id = ?)
  `;
  db.query(checkSession, [sessionId, userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Study session not found or already responded to." });
    }

    const updateSession = "UPDATE study_sessions SET status = ? WHERE id = ?";
    db.query(updateSession, [newStatus, sessionId], (err) => {
      if (err) return res.status(500).json({ message: "Server error" });

      return res.status(200).json({ message: `Study session ${newStatus}.` });
    });
  });
};

// Get all proposed/confirmed study sessions involving the logged-in user
const getMySessions = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  const query = `
    SELECT study_sessions.id, study_sessions.connection_id, study_sessions.proposed_by,
           study_sessions.session_date, study_sessions.session_time, study_sessions.location,
           study_sessions.status, users.full_name AS buddy_name
    FROM study_sessions
    JOIN connections ON study_sessions.connection_id = connections.id
    JOIN users ON (
      CASE
        WHEN connections.sender_id = ? THEN connections.receiver_id = users.id
        ELSE connections.sender_id = users.id
      END
    )
    WHERE (connections.sender_id = ? OR connections.receiver_id = ?)
    AND study_sessions.status IN ("proposed", "confirmed")
    ORDER BY study_sessions.session_date ASC, study_sessions.session_time ASC
  `;

  db.query(query, [userId, userId, userId], (err, sessions) => {
    if (err) return res.status(500).json({ message: "Server error" });

    return res.status(200).json({ sessions });
  });
};

module.exports = { proposeSession, respondSession, getMySessions };
