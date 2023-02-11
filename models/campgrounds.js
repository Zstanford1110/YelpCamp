const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');


const ImageSchema = new Schema({
    url: String,
    filename: String,
})

// Made a separate schema (but no model) for our image so we can add a virtual property that will be able to 
// translate our URLs to a thumbnail version using the Cloudinary API
// We don't need to store this extra URL on our schema, it is derived from our original URL so we make a virtual property
// Virtual properties look like they are attached to a schema/document but they are not actually saved to a DB
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})


// By default, whenever we convert a Mongoose document to JSON we lose the virtuals, but if we set this option we preserve virtuals by saving their output as part of the JSON
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            requireD: true
        }
    },
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href=/campgrounds/${this._id}>${this.title}</a></strong>
    <p>${this.description.substring(0, 30)}...</p>`
})

// Middleware to handle the deletion of campgrounds now that they have reviews tied to them
// Query middleware, will fire if document is found and deleted, does nothing if not
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // delete all the reviews from the reviews array in our deleted Campground document
        await Review.deleteMany({
            _id: {
                $in: doc.reviews // Delete review by id if it is in our document's reviews arrays
            }
        });
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);