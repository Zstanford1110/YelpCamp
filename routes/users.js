const express = require('express');
const router = express.Router({ mergeParams: true }); // Routers separate the regular req.params and its own params, need to merge them with this option
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const usersController = require('../controllers/users');


router.route('/register')
    .get(usersController.renderRegisterForm) // New user route
    .post(catchAsync(usersController.registerUser)) // Create user route

router.route('/login')
    .get(usersController.renderLoginForm) // Show login route
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), usersController.loginUser) // Login route


router.get('/logout', usersController.logoutUser);

module.exports = router;