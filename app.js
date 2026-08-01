// Load environment variables
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

// Import database connection
const db = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Create express app
const app = express();

// Middleware — parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

// Serve HTML files from views folder
app.use(express.static(path.join(__dirname, "views")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/settings", settingsRoutes);

// Home route — redirect to login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Catch-all for unmatched routes — must be last
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// Global error handler — final safety net. Without this, an uncaught
// exception in a route (e.g. a thrown error from a database driver)
// falls through to Express's default handler, which returns an HTML
// page instead of the JSON { message } shape every API route uses,
// and can leak internal error details to the client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
