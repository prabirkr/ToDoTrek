const express = require('express');
const { login, register } = require('../controllers/auth.controller.js');
const { registerValidation, loginValidation, handleValidationErrors } = require('../middlewares/validation.js');

const router = express.Router();

router.post("/register", registerValidation,handleValidationErrors,register)
router.post("/login", loginValidation,handleValidationErrors,login);

module.exports = router;