const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


// We don't need to specify username and password in the Schema when we use Passport
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Passport adds on the username (guarantees uniqueness) and password fields to our schema
// Handles salting and hashing as well
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);