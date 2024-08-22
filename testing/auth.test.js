const { register, login } = require('../controllers/auth.controller.js');
const User = require('../models/user.model.js');
const JWT = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../middlewares/auth.utils');
const { StatusCodes } = require('http-status-codes');

// Mocking dependencies
jest.mock('../models/user.model');
jest.mock('jsonwebtoken');
jest.mock('../middlewares/auth.utils');
jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

describe('Auth Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const req = {
                body: { email: 'test@example.com', password: 'password123' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            // Mocks
            User.findOne = jest.fn().mockResolvedValue(null);
            hashPassword.mockResolvedValue('hashedpassword');
            User.create = jest.fn().mockResolvedValue({
                _id: 'userId',
                email: 'test@example.com',
                password: 'hashedpassword',
            });

            await register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(hashPassword).toHaveBeenCalledWith('password123');
            expect(User.create).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'hashedpassword',
            });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Successfully Registered",
                user: {
                    _id: 'userId',
                    email: 'test@example.com',
                },
            });
        });

        it('should return an error if user already exists', async () => {
            const req = {
                body: { email: 'test@example.com', password: 'password123' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            // Mocks
            User.findOne = jest.fn().mockResolvedValue({
                _id: 'userId',
                email: 'test@example.com',
                password: 'hashedpassword',
            });

            await register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Email Already Registered ! Please Login",
            });
        });

        it('should return an internal server error on exception', async () => {
            const req = {
                body: { email: 'test@example.com', password: 'password123' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            //   Mocks
            User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Error In Register API",
                error: expect.any(Error),
            });
        });
    });

    describe('login', () => {
        it('should login user and return tokens', async () => {
            const req = {
                body: { email: 'test@example.com', password: 'password123' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            // Mocks
            User.findOne = jest.fn().mockResolvedValue({
                _id: 'userId',
                email: 'test@example.com',
                password: 'hashedpassword',
            });
            comparePassword.mockResolvedValue({ success: true });
            JWT.sign = jest.fn()
                .mockReturnValueOnce('accessToken')
                .mockReturnValueOnce('refreshToken');
            JWT.decode = jest.fn()
                .mockReturnValueOnce({ exp: 123456 })
                .mockReturnValueOnce({ exp: 654321 });

            await login(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(JWT.sign).toHaveBeenCalledWith({ id: 'userId' }, process.env.JWT_SECRET, { expiresIn: "90s" });
            expect(JWT.sign).toHaveBeenCalledWith({ id: 'userId' }, process.env.JWT_REFRESH_SECRET, { expiresIn: "60s" });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Login Successfully",
                accessToken: 'accessToken',
                refreshToken: 'refreshToken',
                accessTokenExpiresAt: 123456,
                refreshTokenExpiresAt: 654321,
                user: {
                    _id: 'userId',
                    email: 'test@example.com',
                },
            });
        });

        it('should return an error if user not found', async () => {
            const req = {
                body: { email: 'test@example.com', password: 'password123' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            // Mocks
            User.findOne = jest.fn().mockResolvedValue(null);

            await login(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "User Not Found",
            });
        });

        it('should return an error if password is incorrect', async () => {
            const req = {
                body: { email: 'test@example.com', password: 'password123' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            // Mocks
            User.findOne = jest.fn().mockResolvedValue({
                _id: 'userId',
                email: 'test@example.com',
                password: 'hashedpassword',
            });
            comparePassword.mockResolvedValue({ success: false, status: StatusCodes.UNAUTHORIZED, message: "Invalid password" });

            await login(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Invalid password",
            });
        });

        it('should return an internal server error on exception', async () => {
            const req = {
                body: { email: 'test@example.com', password: 'password123' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            // Mocks
            User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Error In Login API",
                error: expect.any(Error),
            });
        });
    });
});
