const express = require('express');
const dotenv = require('dotenv');
const { StatusCodes } = require('http-status-codes');
const dbconnection = require('./config/database.js');
const authRoutes = require('./routes/auth.routes.js');
const taskRoutes = require('./routes/task.routes.js');
const session = require('express-session');
const passport = require('passport');
const JWT = require('jsonwebtoken')

// Require and initialize OAuth controller
require('./controllers/oauth.controller.js');


// Load environment variables
dotenv.config();

// database connection
dbconnection();

// express object 
const app = express();


// Session setup
app.use(session({
  secret: process.env.GOOGLE_CLIENT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Initialize passport and configure sessions
app.use(passport.initialize());
app.use(passport.session());


// middlewares
app.use(express.json());


// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {

    // token generation for google user
    const token = JWT.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '100s' })
    console.log(token);
    res.status(StatusCodes.OK).json({  message: 'Authentication successful' });
  });

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, (req, res) => {
  return console.log(`Server is running on port ${PORT}`);
});