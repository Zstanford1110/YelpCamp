if (process.env.NODE_ENV !== "production") {
    // If we are running the app in dev mode and not production, load environment variables from .env to NODE to make them accessible
    require('dotenv').config();
    // Gain access to variables as 'process.env.<VARIABLE>'
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo'); // Enable Mongo as the Session Store instead of MemoryStore

// node -i -e "$(< index.js)"
// Deprecation warning handling setting
mongoose.set('strictQuery', false);

// Dev URL: mongodb://127.0.0.1:27017/YelpCamp
// Production URL: process.env.DB_URL; 
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/YelpCamp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

// Utilize ejsMate as the EJS engine (parsing, interpreting, etc. of EJS) instead of the default one
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// NPM Package express-mongo-sanitize will sanitize the query string in the URL by removing Mongo operator characters from the request (i.e., $ or .)
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisisadevelopmentbackupsecret';

// Session Store w/ Mongo
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
})



// Configure express sessions so we can track user sessions by id
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: { // Advanced options for the session cookie stored in the browser
        expires: Date.now() + 604800000, // One week before it expires
        maxAge: 604800000,
        httponly: true, // mitigates XSS by not allowing the user to access the cookie outside of HTTP requests
        secure: true
    }
}

app.use(session(sessionConfig));
// Set up 'npm i connect-flash' in order to flash messages after an action (i.e., inform the user their review/campground was submitted on the page we redirect to)
// The flash message will disappear after the user refreshes or navigates away from the flashed page
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dzqx0jdv1/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// Configure passport as middleware
app.use(passport.initialize());
app.use(passport.session()); // Enable persistent login sessions, must be used after express-session
passport.use(new localStrategy(User.authenticate())); // Tell passport to use the local (username/password) strategy with our User model
// Inform Passport how to store and retrieve data to/from a User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Create flash middleware to add a local variable into each route giving access to flash messages we have logged
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // Passport provides a req.user property with the mongo document data stored, we are making it into a global property for our ejs templates here
    res.locals.success = req.flash('success'); // Capture our flash message and store it in res.locals.success to make it available in templates
    res.locals.error = req.flash('error'); // Capture our error flash messages to use as local variables in templates
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'epic@gmail.com', username: 'epicman' });
    const newUser = await User.register(user, 'password123');
    res.send(newUser);
})


// Using the campgrounds router
app.use('/campgrounds', campgroundRoutes);
// Using the reviews router
app.use('/campgrounds/:id/reviews', reviewRoutes);
// Using the users router
app.use('/', userRoutes);

// home view
app.get('/', (req, res) => {
    res.render('home');
})

// Default, catch-all route if no other route executes
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).render('error', { err });

})

app.listen(3000, () => {
    console.log("Serving on Port 3000");
})