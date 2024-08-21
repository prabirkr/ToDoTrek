const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/oauth.model.js');
const dotenv = require('dotenv');

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    passReqToCallback: true
},

    async (request, accessToken, refreshToken, profile, done) => {
        try {
            console.log('User Profile:', profile);

            // Check if user already exists in the database
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                return done(null, user, { message: 'already login' });
            } else {
                // If the user is not found, create a new user
                user = await User.create({
                    // googleId: profile.id,
                    email: profile.emails[0].value,
                    displayName: profile.displayName
                });

                // Pass the new user object to the done callback
                return done(null, user);
            }
        } catch (err) {
            return done(err, null);
        }
    }
));

// Serialize user information into the session
passport.serializeUser((user, done) => {
    done(null, user.id); 
});

// Deserialize user information from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); 
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;