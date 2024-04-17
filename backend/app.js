const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path'); // NODE JS Package

/**
 * STATUS CODE
 * 200 - Everything is good.
 * 201 - Everything is good AND a new resource is created.
 */

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

// DB will now be connected automatically, if server is running
mongoose.connect('mongodb+srv://ayudi116:paSBjpAs8fo65G5G@cluster0.vy5yube.mongodb.net/node-angular?retryWrites=true&w=majority&appName=Cluster0') // 'node-angular or test(default)' is database name here
    .then(() => {
        console.log('Database connected.');
    })
    .catch(() => {
        console.log('Database connection error!!');
    });

const app = express();

/** bodyParser can be used for JSON and URLEncoded things, but can't do anything about the Files (images here).
 * So, to handle that, have installed 'multer' package. */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// express.static() be a middleware here which will tell that any requests targeting '/images' will be given accessed to what is provided inside its parameters. However, in this case, '/images' be redirected to 'backend/images'
app.use('/images', express.static(path.join('backend/images')));

// // middleware concept
// app.use((req, resp, next) => {
//     console.log("First Middleware");
//     next(); // if commented out, it will not reach below middlewares and page will not get loaded.
// });

// app.use('/posts', (req, resp, next) --> it means all the requests targeting "localhost:3000/posts" will reach this middleware while others will simply be voided as there is no handling present currently.

// CORS resolution --> localhost:4200 and localhost:3000
app.use((req, resp, next) => {
    resp.setHeader('Access-Control-Allow-Origin', '*'); // disabling the security to enable data flow between different servers --> in this case localhost:4200 and localhost:3000
    resp.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    resp.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
    next();
});

// All routes are imported in ./router/posts.js - and now those routes can be accessed as below
app.use('/api/posts', postsRoutes); // route for posts.js -> So, no need to add the path on every request
app.use('/api/user', userRoutes); // route for user.js

// exporting the express app - as a listener, instead of clipping(Ctrl+C) node server again-n-again
module.exports = app; // All middleware will be exported along with the express-app