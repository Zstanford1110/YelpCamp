const express = require('express');
const router = express.Router({ mergeParams: true }); // Routers separate the regular req.params and its own params, need to merge them with this option
const catchAsync = require('../utils/catchAsync');
const reviewController = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


// Review create route
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview));

// Review delete route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

module.exports = router;