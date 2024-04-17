const jwt = require('jsonwebtoken');

module.exports = (req, resp, next) => {
    // const token = req.queryParams.authorization; // Using Query parameters of URL
    try {
        const token = req.headers.authorization.split(" ")[1]; // "Bearer <token>"
        const decodedToken = jwt.verify(token, 'secret-key_this-should-be-longer_stored-on-server_used-to-validate-hashes'); // 2nd param --> this string could be anything, for example: we've put it like this to read the meaning
        req.userData = {
            email: decodedToken.email,
            userId: decodedToken.userId
        };
        console.log
        next();
    } catch (err) {
        resp.status(401).json({
            message: 'Authentication failed.',
            error: err
        });
    }
};