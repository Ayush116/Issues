const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// DB Access for 'User' schema at server-side
const User = require('../models/user');

const router = express.Router();

router.post('/signup', (req, resp, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => { // bcryot-hash is to encrypt the password coming into DB
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save().then(result => {
            resp.status(200).json({
                message: 'User created.',
                result: result
            });
        }).catch(err => {
            resp.status(500).json({
                message: 'Got an ERROR!!',
                error: err
            });
        });
    });
});

router.post('/login', (req, resp, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            return resp.status(401).json({
                message: 'User not found.'
            });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(result => { // true (success) OR false (failed)
        if (!result) {
            return resp.status(401).json({
                message: 'Incorrect Password.'
            });
        }
        // JSON WEB TOKEN -> SPA TOKEN
        const token = jwt.sign(
            { email: fetchedUser.email, userId: fetchedUser._id },
            'secret-key_this-should-be-longer_stored-on-server_used-to-validate-hashes',
            { expiresIn: '1h' } // token will be expired after an hour
        );
        resp.status(200).json({ // passing to the FRONT-END
            token: token,
            expiresIn: '3600', // defining in seconds
            userId: fetchedUser.userId // userId is already coming as part of token, but to use, we've to decode which will impact performance. So, using as it is.
        });
    }).catch(err => { // some other error
        return resp.status(401).json({
            message: 'Authentication failed.',
            error: err
        });
    });
});

/** // (MAIN Page) Getting list of users
router.get('', (req, resp, next) => {
    // Adding '+' below lines at RHS to change the incoming 'string' to 'integer'
    const pageSize = +req.query.pagesize; // 10
    const currentPage = +req.query.page; // 2
    const userQuery = User.find(); // get all the Users from DB
    let fetchedUsers;
    if (pageSize && currentPage) {
        userQuery
            .skip(pageSize * (currentPage - 1)) // skip all the first 10 posts as 10*(2-1)
            .limit(pageSize); // limits the current posts as per the pageSize as 10
    }
    userQuery.then(documents => {
        fetchedUsers = documents;
        return User.countDocuments();
    }).then(count => {
        resp.json({ // getting the response in JSON format
            message: 'Users fetched successfully',
            users: fetchedUsers,
            totalUsers: count
        });
    });
});
*/

module.exports = router;