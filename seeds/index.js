const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campgrounds');

// Self-contained database seeding file

// Dev Database = 'mongodb://127.0.0.1:27017/YelpCamp'

mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


// Wipe the DB, insert 50 campgrounds with randomized locations and titles
const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '63e3f6d79ef07411ce4d0013',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude,
                cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dzqx0jdv1/image/upload/v1675970885/YelpCamp/nt6e2gnv3ovtfltzlmx2.jpg',
                    filename: 'YelpCamp/nt6e2gnv3ovtfltzlmx2'

                },
                {
                    url: 'https://res.cloudinary.com/dzqx0jdv1/image/upload/v1675970886/YelpCamp/hdcwewaf1pdv84zgcmwp.jpg',
                    filename: 'YelpCamp/hdcwewaf1pdv84zgcmwp'

                },
                {
                    url: 'https://res.cloudinary.com/dzqx0jdv1/image/upload/v1675970885/YelpCamp/qce0ihbest63oyyt4wzg.jpg',
                    filename: 'YelpCamp/qce0ihbest63oyyt4wzg'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe voluptatum repellat facere incidunt nisi doloremque nostrum iure voluptas, dolore dicta alias ut libero. Non voluptatum earum laboriosam magnam optio iste.',
            price
        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
})