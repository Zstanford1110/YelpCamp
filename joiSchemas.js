const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Sanitize our HTML with an extension method on JOI
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});


const joi = BaseJoi.extend(extension);

// JOI Schema to validate our data before even sending to Mongoose, a lot easier and the errors are more transparent
module.exports.campgroundSchema = joi.object({
    campground: joi.object({
        title: joi.string().required().escapeHTML(),
        price: joi.number().required().min(0),
        location: joi.string().required().escapeHTML(),
        description: joi.string().required().escapeHTML(),
        // image: joi.string().required()
    }).required(), // Campground object is required first and foremost
    deleteImages: joi.array()
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        body: joi.string().required().escapeHTML(),
        rating: joi.number().required().max(5).min(1)
    }).required()
});
