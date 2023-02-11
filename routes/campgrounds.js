const express = require('express');
const router = express.Router({ mergeParams: true }); // Routers separate the regular req.params and its own params, need to merge them with this option
const catchAsync = require('../utils/catchAsync');
const campgroundsController = require('../controllers/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer'); // Multer is a package that allows us to parse multipart/form-data from an HTML form (files, text, etc.)
const { storage } = require('../cloudinary');
const upload = multer({ storage }); // Initialize Multer to a specific directory (cloudinary in this case), functions as middleware

// Whenever we have a single route being used for multiple requests (and request methods) we can use this condensed syntax.
// They have to all have the exact same route to be used in this syntax
router.route('/')
    .get(catchAsync(campgroundsController.index)) // Index route
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgroundsController.createCampground)) // Create route


// new route
router.get('/new', isLoggedIn, campgroundsController.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgroundsController.showCampground)) // Show route
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgroundsController.updateCamgpround)) // Update route
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundsController.deleteCampground)) // Delete route

// edit route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundsController.renderEditForm));


module.exports = router;