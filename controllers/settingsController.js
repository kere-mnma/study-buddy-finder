const db = require("../config/db");

const VALID_THEMES = ["light", "dark", "system"];

// Get the logged-in user's settings, creating a default row on first access
const getSettings = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  const findSettings =
    "SELECT theme, push_notifications, email_notifications, sound_effects FROM user_settings WHERE user_id = ?";
  db.query(findSettings, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length > 0) {
      return res.status(200).json(results[0]);
    }

    // No settings row yet — create one with defaults
    const insertSettings = "INSERT INTO user_settings (user_id) VALUES (?)";
    db.query(insertSettings, [userId], (err) => {
      if (err) return res.status(500).json({ message: "Server error" });

      return res.status(200).json({
        theme: "dark",
        push_notifications: 1,
        email_notifications: 1,
        sound_effects: 1,
      });
    });
  });
};

// Save the logged-in user's settings
const updateSettings = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorised. Please log in." });
  }

  const theme = typeof req.body.theme === "string" ? req.body.theme.trim() : "";
  const push_notifications = !!req.body.push_notifications;
  const email_notifications = !!req.body.email_notifications;
  const sound_effects = !!req.body.sound_effects;

  if (!VALID_THEMES.includes(theme)) {
    return res.status(400).json({ message: "Invalid theme selection." });
  }

  const upsertSettings = `
    INSERT INTO user_settings (user_id, theme, push_notifications, email_notifications, sound_effects)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      theme = VALUES(theme),
      push_notifications = VALUES(push_notifications),
      email_notifications = VALUES(email_notifications),
      sound_effects = VALUES(sound_effects)
  `;
  db.query(
    upsertSettings,
    [userId, theme, push_notifications, email_notifications, sound_effects],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });

      return res.status(200).json({ message: "Settings saved." });
    },
  );
};

module.exports = { getSettings, updateSettings };
