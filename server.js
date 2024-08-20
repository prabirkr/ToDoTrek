const express = require('express');
const dotenv = require('dotenv');
const { StatusCodes } = require('http-status-codes');
const dbconnection = require('./config/database.js');
const authRoutes = require('./routes/auth.routes.js');
const session = require('express-session');
const passport = require('passport');
require('./controllers/oauth.controller.js');

// dot env configuration
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

// routes
// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect('/api/v1/users');
    });

app.use('/api/v1/auth/', authRoutes);


app.get('/', (req,res)=>{
    return res.send(StatusCodes.OK).send("hello");
});

const PORT = process.env.PORT;
app.listen(PORT, (req,res)=>{
    return console.log(`Server is running on port ${PORT}`);
});