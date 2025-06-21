const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 获取所有狗狗信息
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.dog_id, d.name, d.breed, d.size, u.username AS owner_name
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching dogs:', err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

module.exports = router;
