const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 登录路由处理
router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
      [username, password]
    );

    if (rows.length === 1) {
      const user = rows[0];

      // 登录成功，将用户信息存入 session
      req.session.user = {
        id: user.user_id,
        username: user.username,
        role: user.role
      };

      res.json({ success: true, role: user.role });
    } else {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
  } catch (err) {
    res.status(500).json({ error: '数据库查询失败', detail: err.message });
  }
});

module.exports = router;
