const mongoose = require('mongoose'); // we are using mongoose instead of mongoDB - because it can use SCHEMA

// Blueprint for how the data should look like - postSchema
const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imagePath: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

// Here Model is 'Post' then 
// Collection will be 'posts' --> lowercase plural of Model's name
module.exports = mongoose.model('Post', postSchema);