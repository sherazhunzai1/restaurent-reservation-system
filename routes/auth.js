const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/auth');

router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/profile', isAuthenticated, authController.profilePage);
router.post('/profile', isAuthenticated, authController.updateProfile);
router.post('/change-password', isAuthenticated, authController.changePassword);

module.exports = router;
