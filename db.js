// db.js
const Database = require('better-sqlite3');
const db = new Database('feedback.db', { verbose: console.log });

// Create feedback table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  agent TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

db.exec(createTableQuery);

module.exports = db;
