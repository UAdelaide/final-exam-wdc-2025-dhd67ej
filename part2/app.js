const express = require('express');
const path = require('path');
const session = require('express-session'); // ✅ 引入 session
require('dotenv').config();

const app = express();

// ✅ 启用 session 中间件
app.use(session({
  secret: 'supersecretkey',       // 可以替换成你的密钥
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }       // 若为 https，请设为 true
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
