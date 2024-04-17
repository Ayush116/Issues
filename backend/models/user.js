const mongoose = require('mongoose'); // mongoose - can use SCHEMA
const uniqueValidator = require('mongoose-unique-validator'); // plugin for unique validator (email)

// Blueprint for how the data should look like - userSchema
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Before saving the data, it will validate whether user exist or not
userSchema.plugin(uniqueValidator);

// Here Model is 'user' then collection will be 'users' --> lowercase plural of Model's name
module.exports = mongoose.model('User', userSchema);