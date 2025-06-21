const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// 启用 session 中间件
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// 引入并注册三条路由
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const dogRoutes = require('./routes/dogs');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dogs', dogRoutes);          

module.exports = app;
