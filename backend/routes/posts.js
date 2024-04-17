const express = require('express');
const multer = require('multer');

// DB Access for 'Post' schema at server-side
const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/gif': 'gif'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let err = new Error("Invalid mime type!!");
        if (isValid) {
            err = null;
        }
        callback(err, 'backend/images'); // path given here is in same directory with 'server.js'
    },
    filename: (req, file, callback) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const extension = MIME_TYPE_MAP[file.mimetype];
        callback(null, name + '-' + Date.now() + '.' + extension);
    }
});

// router.get();
// router.post();

// Only for incoming post requests --> checkAuth is added to protect (auth) routes
router.post('', checkAuth, multer({storage: storage}).single('image'), (req, resp, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({ // new Post() --> instantiated the Post data to create the Post
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });
    // console.log(post); // Instead of logging to console - we can save it in DB
    // post.save(); // mongoose --> Insert a new entry but post.save().then(x) can take the result 'x' and can log it
    post.save().then(createdPost => {
        resp.status(201).json({
            message: 'Post added.',
            post: {
                // ONE WAY
                    // id: createdPost._id,
                    // title: createdPost.title,
                    // content: createdPost.content,
                    // imagePath: createdPost.imagePath

                // ANOTHER WAY
                ...createdPost, // '...' spread-operator to copy all properties of an object to another
                id: createdPost._id // and add further properties as needed
            }
        });
    });
    // next(); // Because response is already sent
});

// Updating the post to edit
    // router.put() -> put a new resource and replaced the old one
        // checkAuth is added to protect (auth) routes
    router.put('/:id', checkAuth, multer({storage: storage}).single('image'), (req, resp, next) => {
        let imagePath = req.body.imagePath;
        if (req.file) {
            const url = req.protocol + '://' + req.get('host');
            imagePath = url + '/images/' + req.file.filename
        }
        const post = new Post({
            _id: req.body.id, // to not update the resource with new ID
            title: req.body.title,
            content: req.body.content,
            imagePath: imagePath,
            creator: req.userData.userId
        });
        Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
            .then(result => {
                if (result.modifiedCount > 0) {
                    resp.status(200).json({
                        message: 'Updated successfully.'
                    });
                } else {
                    resp.status(401).json({
                        message: 'Not Authorized!!'
                    });
                }
            });
    });

    // // router.patch() -> to only update an existing resource
    // router.patch('/api/posts/:title', (req, resp, next) => {
    //     //
    // });

// (MAIN Page) Getting list of posts
router.get('', (req, resp, next) => { // changing from 'router.use()' to 'router.get()' as we've added 'router.post()' to handle post's req-&-response.
    // Adding '+' below lines at RHS to change the incoming 'string' to 'integer'
    const pageSize = +req.query.pagesize; // 10
    const currentPage = +req.query.page; // 2
    const postQuery = Post.find();
    let fetchedPosts;
    if (pageSize && currentPage) {
        postQuery
            .skip(pageSize * (currentPage - 1)) // skip all the first 10 posts as 10*(2-1)
            .limit(pageSize); // limits the current posts as per the pageSize as 10
    }
    /** Removing DUMMY Data instead will fetch from DB.
     * const posts = [
     *   {
     *      id: 'sadfghtrywtgsh',
     *      title: 'First dummy server-side Post',
     *      content: 'This is the content here..'
     *   },
     *   {
     *      id: 'fykutresrtheff',
     *      title: 'Second dummy server-side Post',
     *      content: 'This is the content here!!'
     *   }
     * ];
     */
    postQuery.then(documents => {
        fetchedPosts = documents;
        // Post.count() is not working with latest s/w updates -> Post.countDoucments()
        return Post.countDocuments();
    }).then(count => {
        resp.json({ // getting the response in JSON format
            message: 'Posts fetched successfully',
            posts: fetchedPosts,
            totalPosts: count
        });
    });
});

// (EDIT Page) Getting details of post for the required ":id" as mentioned in first parameter.
router.get('/:id', (req, resp, next) => {
    Post.findById(req.params.id).then(post => {
        if (post) {
            resp.status(200).json(post);
        } else {
            resp.status(404).json({
                message: 'Post not found!'
            });
        }
    });
});

// Deleting the post, with DELETE button --> checkAuth is added to protect (auth) routes
router.delete('/:id', checkAuth, (req, resp, next) => { // (property) ':id' is dynamic and will take all possible 'post.id' which asked to be deleted and those will be extracted by express automatically.
    console.log('Post referenced to id(' + req.params.id + ') is getting deleted.'); // 'params' is a property managed by express, which gives access to all encoded parameters --> in this case as 'id'
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
        .then(result => {
            if (result.deletedCount > 0) {
                resp.status(200).json({
                    message: 'Deleted successfully.'
                });
            } else {
                resp.status(401).json({
                    message: 'Not Authorized!!'
                });
            }
        });
});

module.exports = router;