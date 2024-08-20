const User = require("../models/user.model.js");
const JWT = require("jsonwebtoken");
const { hashPassword, comparePassword } = require('../middlewares/auth.utils.js');
const { StatusCodes } = require('http-status-codes');
const dotenv = require('dotenv');

dotenv.config();

// REGISTER
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check user
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                success: false,
                message: "Email Already Registered ! Please Login",
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const user = await User.create({
            ...req.body,
            password: hashedPassword,

        })

        // remove password field from user object  
        user.password = undefined;

        return res.status(StatusCodes.CREATED).send({
            success: true,
            message: "Successfully Registered",
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: "Error In Register API",
            error,
        });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).send({
                success: false,
                message: "User Not Found",
            });
        }

        // Compare password
        const passwordCheck = await comparePassword(password, user.password);
        if (!passwordCheck.success) {
            return res.status(passwordCheck.status).send({
                success: false,
                message: passwordCheck.message,
            });
        }
        console.log({ JWT_SECRET: process.env.JWT_SECRET, refersh: process.env.JWT_REFRESH_SECRET })

        // Generates tokens
        const accessToken = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "445s",
        });
        const refreshToken = JWT.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "60s",
        });

        const accessTokenPayload = JWT.decode(accessToken);
        const refreshTokenPayload = JWT.decode(refreshToken);

        // remove password field from user object  
        user.password = undefined;

        res.status(StatusCodes.OK).send({
            success: true,
            message: "Login Successfully",
            accessToken,
            refreshToken,
            accessTokenExpiresAt: accessTokenPayload.exp,
            refreshTokenExpiresAt: refreshTokenPayload.exp,
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: "Error In Login API",
            error,
        });
    }
};

module.exports = { register, login };
