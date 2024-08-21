const { body, param, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');

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
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Invalid phone number format'),
    body('age')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Invalid age format'),
];

// Login validation rules
const loginValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Task creation validation rules
const validateCreateTask = [
    body('title').notEmpty().withMessage('Title is required'),
    body('todo').notEmpty().withMessage('Todo is required'),
];

// Task update validation rules
const validateUpdateTask = [
    // param('id').custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid task ID'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('todo').optional().notEmpty().withMessage('Todo cannot be empty'),
];

// Task deletion validation rules
const validateDeleteTask = [
    param('id').custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid task ID')
];

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    registerValidation,
    loginValidation,
    validateCreateTask,
    validateUpdateTask,
    validateDeleteTask,
    handleValidationErrors,
};
