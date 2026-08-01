const path = require("path");
const multer = require("multer");
const db = require("../config/db");

// Multer setup for profile picture uploads
const pictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user-${req.session.userId}-${Date.now()}${ext}`);
  },
});

const pictureFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG and PNG images are allowed"));
  }
  cb(null, true);
};

const uploadPictureMiddleware = multer({
  storage: pictureStorage,
  fileFilter: pictureFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("profile_picture");

// Get a user's profile
const getProfile = (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT users.id, users.full_name, users.email, users.course,
           profiles.modules, profiles.study_location, profiles.bio,
           profiles.profile_picture
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

  const course = typeof req.body.course === "string" ? req.body.course.trim() : "";
  const modules = typeof req.body.modules === "string" ? req.body.modules.trim() : "";
  const study_location = typeof req.body.study_location === "string" ? req.body.study_location.trim() : "";
  const bio = typeof req.body.bio === "string" ? req.body.bio.trim() : "";

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
    SELECT users.id, users.full_name, users.course, users.last_active,
           profiles.modules, profiles.study_location, profiles.bio,
           profiles.profile_picture
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

// Browse all students, paginated
const browseAll = (req, res) => {
  const userId = req.session.userId;

  // Check user is logged in
  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM users
    JOIN profiles ON users.id = profiles.user_id
    WHERE users.id != ?
  `;

  const resultsQuery = `
    SELECT users.id, users.full_name, users.course, users.last_active,
           profiles.modules, profiles.study_location, profiles.profile_picture
    FROM users
    JOIN profiles ON users.id = profiles.user_id
    WHERE users.id != ?
    ORDER BY users.full_name
    LIMIT ? OFFSET ?
  `;

  db.query(countQuery, [userId], (err, countResults) => {
    if (err) return res.status(500).json({ message: "Server error" });

    const total = countResults[0].total;

    db.query(resultsQuery, [userId, limit, offset], (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      return res.status(200).json({
        results,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      });
    });
  });
};

// Upload a profile picture
const uploadPicture = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  uploadPictureMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const profilePicturePath = `/uploads/${req.file.filename}`;

    const updatePicture = "UPDATE profiles SET profile_picture = ? WHERE user_id = ?";
    db.query(updatePicture, [profilePicturePath, userId], (err) => {
      if (err) return res.status(500).json({ message: "Server error" });

      return res.status(200).json({
        message: "Profile picture updated.",
        profile_picture: profilePicturePath,
      });
    });
  });
};

module.exports = { getProfile, updateProfile, searchBuddies, browseAll, uploadPicture };
