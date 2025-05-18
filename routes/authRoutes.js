const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { requestVerification }  = require('../controllers/authController');
const { verifyEmail } = require('../controllers/authController');
const { register } = require('../controllers/authController');
const { login } = require('../controllers/authController');
const { getProfile } = require('../controllers/authController');

router.post('/request-verification', requestVerification);
router.post('/verify-email', verifyEmail);
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;