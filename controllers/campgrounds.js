const Campground = require('../models/campgrounds');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // Initialize MapBox API connection w/ our token 


// Index callback
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

// New route (form)
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

// Create campground callback
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry; // Add MapBox coordinates to use in displaying locations on a map
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id; // Set the author of the campground to be the currently signed in user.
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully created a new campground!'); // Flash if we successfully upload and make it to this point, now we can display it on our template we redirect to
    res.redirect(`/campgrounds/${campground._id}`);
}

// Show campground by ID callback
module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: { // Nested populate, populate all of the reviews and populate each of their authors
            path: 'author'
        }
    }).populate('author'); // This populates the author of the campground
    if (!campground) {
        req.flash('error', 'Campground cannot be found :(');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}

// Render edit form by campground ID callback
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) { // Verify the campground exists
        req.flash('error', 'Campground cannot be found :(');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}

// Update campground by ID callback
module.exports.updateCamgpround = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); // Generate an array of uploaded images
    campground.images.push(...imgs); // We need to push, not overwrite the existing images. We also need to spread each individual image out of the input array so we arent pushing an array inside of an array (Type error!)
    await campground.save();
    // If we have images in the deleteImages array (populated using HTML/EJS) from the edit form, delete those images
    if (req.body.deleteImages) {
        // Delete from our cloud (Cloudinary)
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        // Delete from Mongo documents
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

// Delete campground by ID callback
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}