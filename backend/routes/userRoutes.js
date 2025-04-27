const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { getUserProfile, updateUserProfile, getUserBalance } = require('../controllers/userController');

router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.get('/balance', authenticate, getUserBalance);

module.exports = router;