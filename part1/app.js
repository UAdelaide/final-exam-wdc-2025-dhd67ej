// part1/app.js

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;

// Create DB connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
};

let db;

// Helper: Insert seed data on startup
async function insertSeedData() {
  try {
    await db.query("DELETE FROM WalkRatings");
    await db.query("DELETE FROM WalkApplications");
    await db.query("DELETE FROM WalkRequests");
    await db.query("DELETE FROM Dogs");
    await db.query("DELETE FROM Users");

    await db.query(`
      INSERT INTO Users (username, email, password_hash, role) VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner')
    `);

    await db.query(`
      INSERT INTO Dogs (owner_id, name, size) VALUES
      ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
      ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small')
    `);

    await db.query(`
      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
      ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted')
    `);

    await db.query(`
      INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES
      (2, (SELECT user_id FROM Users WHERE username = 'bobwalker'), (SELECT user_id FROM Users WHERE username = 'carol123'), 5, 'Great job!')
    `);

    console.log('✅ Seed data inserted.');
  } catch (err) {
    console.error('❌ Error inserting seed data:', err);
  }
}

// Connect to DB and insert data
(async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    await insertSeedData();
  } catch (error) {
    console.error('❌ Failed to connect to DB:', error);
    process.exit(1);
  }
})();

// Route 1: /api/dogs
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve dogs.' });
  }
});

// Route 2: /api/walkrequests/open
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT w.request_id, d.name AS dog_name, w.requested_time, w.duration_minutes, w.location, u.username AS owner_username
      FROM WalkRequests w
      JOIN Dogs d ON w.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE w.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve walk requests.' });
  }
});

// Route 3: /api/walkers/summary
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        ROUND(AVG(r.rating), 1) AS average_rating,
        SUM(CASE WHEN wr.status = 'completed' THEN 1 ELSE 0 END) AS completed_walks
      FROM Users u
      LEFT JOIN WalkApplications a ON u.user_id = a.walker_id
      LEFT JOIN WalkRequests wr ON a.request_id = wr.request_id
      LEFT JOIN WalkRatings r ON wr.request_id = r.request_id AND r.walker_id = u.user_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve walker summary.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

