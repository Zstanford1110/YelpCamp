const User = require('../models/user');

// Render new user registration form callback
module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

// Register new user callback
module.exports.registerUser = async (req, res) => {
    // We want to flash messages explaining why a user did not successfully register (no security hints), instead of redirecting with our default error handler
    // We  will need to wrap this in another try catch
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        // Use the register helper function added by Passport to our model to generate password salt and hash for the user
        await User.register(user, password);
        // Log the user in after registering so they don't have to hit login right after
        // Have to use req.login() method, we can't use passport.authenticate as middleware because we are making a new user
        req.login(user, err => {
            if (err) { return next(err); }
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        })
    } catch (e) { // Flash error if any occur during registration
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

// Render existing user login form callback
module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

// Login callback for passport to perform login
module.exports.loginUser = (req, res) => {
    // If you made it past the middleware, you were successfully logged in
    req.flash('success', 'Welcome back!');
    const redirectURL = req.session.returnTo || '/campgrounds'; // If there is a returnTo URL, go back there after logging in.
    delete req.session.returnTo // Remove the returnTo after we redirect back
    res.redirect(redirectURL);
}

// Logout callback
module.exports.logoutUser = (req, res, next) => {
    // Passport adds login() and logout() to the req as methods. Just call req.logout and the session is ended
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', "Goodbye!");
        res.redirect('/campgrounds');
    });
}