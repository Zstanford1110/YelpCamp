const Review = require('../models/reviews');
const Campground = require('../models/campgrounds');


// Create review callback
module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id; // Set the author property of the review
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// Delete review callback
module.exports.deleteReview = async (req, res) => {
    // Use the Mongo operator '$pull' to remove a specified value from an array ( the reviews array, based on review ID)
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}