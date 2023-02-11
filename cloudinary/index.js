const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Associate our Cloudinary API credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

// Instantiate a Cloudinary storage object provided by the multer-storage-cloudinary package
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp', // Folder in Cloudinary to store to
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

// Export both cloudinary object and storage object
module.exports = {
    cloudinary,
    storage
}