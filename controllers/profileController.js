const db = require("../config/db");

// Get a user's profile
const getProfile = (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT users.id, users.full_name, users.email, users.course,
           profiles.modules, profiles.study_location, profiles.bio
    FROM users
    JOIN profiles ON users.id = profiles.user_id
    WHERE users.id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(results[0]);
  });
};

// Update a user's profile
const updateProfile = (req, res) => {
  const userId = req.session.userId;

  // Check user is logged in
  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  const { modules, study_location, bio, course } = req.body;

  // Validate required fields
  if (!modules || !course) {
    return res
      .status(400)
      .json({ message: "Course and at least one module are required" });
  }

  // Update course in users table
  const updateUser = "UPDATE users SET course = ? WHERE id = ?";
  db.query(updateUser, [course, userId], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    // Update profile in profiles table
    const updateProfile =
      "UPDATE profiles SET modules = ?, study_location = ?, bio = ? WHERE user_id = ?";
    db.query(updateProfile, [modules, study_location, bio, userId], (err) => {
      if (err) return res.status(500).json({ message: "Server error" });

      return res
        .status(200)
        .json({ message: "Your profile has been updated." });
    });
  });
};

// Search for study buddies
const searchBuddies = (req, res) => {
  const userId = req.session.userId;

  // Check user is logged in
  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  const { keyword, location } = req.query;

  if (!keyword) {
    return res.status(400).json({ message: "Please enter a search keyword" });
  }

  let query = `
    SELECT users.id, users.full_name, users.course,
           profiles.modules, profiles.study_location, profiles.bio
    FROM users
    JOIN profiles ON users.id = profiles.user_id
    WHERE users.id != ?
    AND (profiles.modules LIKE ? OR users.course LIKE ?)
  `;

  const params = [userId, `%${keyword}%`, `%${keyword}%`];

  // Apply location filter if provided
  if (location && location !== "all") {
    query += " AND profiles.study_location = ?";
    params.push(location);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) {
      return res
        .status(200)
        .json({
          message: "No study buddies found matching your search.",
          results: [],
        });
    }

    return res.status(200).json({ results });
  });
};

module.exports = { getProfile, updateProfile, searchBuddies };
