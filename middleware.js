const Campground = require('./models/campgrounds');
const Review = require('./models/reviews');
const { campgroundSchema, reviewSchema } = require('./joiSchemas.js');
const ExpressError = require('./utils/ExpressError');

// Passport gives us access to the isAuthenticated() function to check if a user has logged in
// We can protect our routes to prevent unsigned in clients from taking certain actions
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // Add the original URL the user was redirected to the login page from to the session
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    next(); // If logged in, go ahead to the next middleware
}

// Middleware function to verify if a user is an author of a campground they are editting or deleting
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) { // Verify the campground exists
        req.flash('error', 'You do not have permission to update that campground.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    // Call the schema on the req.body to validate it 
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to delete that review.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}