const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
  secret: 'mySecret', // 可以使用 process.env.SECRET 更安全
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// 路由注册
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const loginRoute = require('./routes/login');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/login', loginRoute);

module.exports = app;
