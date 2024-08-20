const express = require('express');
const { login, register } = require('../controllers/auth.controller.js');
const { registerValidation, loginValidation } = require('../middlewares/validation.js');

const router = express.Router();

router.post("/register", registerValidation,register)
router.post("/login", loginValidation,login);

module.exports = router;