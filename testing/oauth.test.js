const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/oauth.model.js');
const dotenv = require('dotenv');

dotenv.config();

jest.mock('passport-google-oauth20', () => ({
    Strategy: jest.fn(),
}));

jest.mock('../models/oauth.model.js', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
}));

describe('Passport Google OAuth Strategy', () => {
    let mockUser;
    let mockVerifyCallback;

    beforeEach(() => {
        mockUser = { id: '123', email: 'test@example.com', displayName: 'Test User' };
        User.findOne.mockReset();
        User.create.mockReset();
        User.findById.mockReset();

        // Mock the GoogleStrategy constructor to capture the verify callback
        GoogleStrategy.mockImplementation((options, verify) => {
            mockVerifyCallback = verify; 
        });
    });

    test('should serialize user into session', (done) => {
        passport.serializeUser((user, done) => {
            expect(user).toBe(mockUser);
            done(null, user.id);
        });

        passport.serializeUser(mockUser, done);
    });

    test('should deserialize user from session', async () => {
        User.findById.mockResolvedValue(mockUser);

        passport.deserializeUser(async (id, done) => {
            const user = await User.findById(id);
            expect(user).toBe(mockUser);
            done(null, user);
        });

        await passport.deserializeUser(mockUser.id, (err, user) => {
            expect(err).toBeNull();
            expect(user).toBe(mockUser);
        });
    });

    test('should handle user login and registration with GoogleStrategy', async () => {
        const mockProfile = {
            emails: [{ value: 'test@example.com' }],
            displayName: 'Test User',
        };
        const accessToken = 'mockAccessToken';
        const refreshToken = 'mockRefreshToken';
        const done = jest.fn();

        
        new GoogleStrategy(
            {
                clientID: 'test-client-id',
                clientSecret: 'test-client-secret',
                callbackURL: 'test-callback-url'
            },
            (accessToken, refreshToken, profile, done) => {
                // Store the verify callback function
                mockVerifyCallback = (token, tokenSecret, profile, done) => {
                    User.findOne.mockResolvedValue(mockUser);
                    return User.findOne({ email: profile.emails[0].value })
                        .then(user => {
                            if (user) {
                                return done(null, user);
                            }
                            return User.create({
                                id: profile.id,
                                email: profile.emails[0].value,
                                displayName: profile.displayName
                            }).then(newUser => done(null, newUser));
                        })
                        .catch(err => done(err));
                };

                // Call the verify callback function
                mockVerifyCallback(accessToken, refreshToken, profile, done);
            }
        );

        // Test existing user case
        User.findOne.mockResolvedValue(mockUser);

        // Call the verify function with mock data
        await mockVerifyCallback(accessToken, refreshToken, mockProfile, done);

        // Check if the existing user was found and returned
        expect(done).toHaveBeenCalledWith(null, mockUser);

        // Test new user case
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(mockUser);

        // Call the verify function with mock data again
        await mockVerifyCallback(accessToken, refreshToken, mockProfile, done);

        // Check if a new user was created and returned
        expect(done).toHaveBeenCalledWith(null, mockUser);
    });
});
