const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    // ── TEMPORARY DIAGNOSTIC LOGGING — remove once the Railway DB connection issue is resolved ──
    console.error("Database connection failed. Full diagnostic info follows:");
    console.error("Full error object:", err);
    console.error("err.code:", err.code);
    console.error("err.message:", err.message);
    console.error("Connection config read from process.env:");
    console.error("  DB_HOST:", process.env.DB_HOST);
    console.error("  DB_PORT:", process.env.DB_PORT);
    console.error("  DB_USER:", process.env.DB_USER);
    console.error("  DB_NAME:", process.env.DB_NAME);
    console.error(
      "  DB_PASSWORD:",
      process.env.DB_PASSWORD
        ? `[set, length ${process.env.DB_PASSWORD.length}]`
        : "[NOT SET]",
    );
    // ── END TEMPORARY DIAGNOSTIC LOGGING ──
    return;
  }
  console.log("Connected to MySQL database successfully");
});

module.exports = db;
