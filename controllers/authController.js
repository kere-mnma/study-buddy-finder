const bcrypt = require('bcrypt');
const db = require('../config/db');

// Register a new user
const register = (req, res) => {
  const { full_name, email, course, password, security_question, security_answer } = req.body;

  // Validate all fields are filled
  if (!full_name || !email || !course || !password || !security_question || !security_answer) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate password length
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  // Check if email already exists
  const checkEmail = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmail, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      // Hash the security answer
      bcrypt.hash(security_answer, 10, (err, answerHash) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        // Insert new user into database
        const insertUser = 'INSERT INTO users (full_name, email, password_hash, course, security_question, security_answer_hash) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(insertUser, [full_name, email, hash, course, security_question, answerHash], (err, result) => {
          if (err) return res.status(500).json({ message: 'Server error' });

          // Create empty profile for the new user
          const insertProfile = 'INSERT INTO profiles (user_id) VALUES (?)';
          db.query(insertProfile, [result.insertId], (err) => {
            if (err) return res.status(500).json({ message: 'Server error' });

            return res.status(201).json({ message: 'Registration successful. Please log in.' });
          });
        });
      });
    });
  });
};

// Login a user
const login = (req, res) => {
  const { email, password } = req.body;

  // Validate fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user by email
  const findUser = 'SELECT * FROM users WHERE email = ?';
  db.query(findUser, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare password with hash
    bcrypt.compare(password, user.password_hash, (err, match) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Create session
      req.session.userId = user.id;
      req.session.userName = user.full_name;

      return res.status(200).json({ message: 'Login successful', name: user.full_name, userId: user.id });
    });
  });
};

// Logout a user
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};

// Look up a user's security question by email
const getSecurityQuestion = (req, res) => {
  const { email } = req.body;

  // Validate fields
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Find user by email
  const findUser = 'SELECT security_question FROM users WHERE email = ?';
  db.query(findUser, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length === 0) {
      return res.status(400).json({ message: 'Unable to find a matching account' });
    }

    return res.status(200).json({ security_question: results[0].security_question });
  });
};

// Reset a user's password using their security answer
const resetPassword = (req, res) => {
  const { email, security_answer, newPassword } = req.body;

  // Validate fields
  if (!email || !security_answer || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate password length
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  // Find user by email
  const findUser = 'SELECT * FROM users WHERE email = ?';
  db.query(findUser, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length === 0) {
      return res.status(400).json({ message: 'Unable to reset password with the details provided' });
    }

    const user = results[0];

    // Compare security answer with hash
    bcrypt.compare(security_answer, user.security_answer_hash, (err, match) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      if (!match) {
        return res.status(400).json({ message: 'Unable to reset password with the details provided' });
      }

      // Hash the new password
      bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        // Update the user's password
        const updatePassword = 'UPDATE users SET password_hash = ? WHERE email = ?';
        db.query(updatePassword, [hash, email], (err) => {
          if (err) return res.status(500).json({ message: 'Server error' });

          return res.status(200).json({ message: 'Password reset successful. Please log in.' });
        });
      });
    });
  });
};

module.exports = { register, login, logout, getSecurityQuestion, resetPassword };