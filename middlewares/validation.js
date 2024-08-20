const { body, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

// Registration validation rules
const registerValidation = [
    body('userName').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[\W_]/)
        .withMessage('Password must contain at least one special character'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number format'),
    body('age').optional().isInt({ min: 0 }).withMessage('Invalid age format'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Validation Error',
                errors: errors.array(),
            });
        }
        next();
    }
];

// Login validation rules
const loginValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Validation Error',
                errors: errors.array(),
            });
        }
        next();
    }
];

module.exports = { registerValidation, loginValidation };
