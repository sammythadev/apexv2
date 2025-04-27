const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, adminLogin } = require('../controllers/authController');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/admin/login', adminLogin);

module.exports = router;