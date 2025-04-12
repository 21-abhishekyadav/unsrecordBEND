const jwt = require('jsonwebtoken');
const JWTS = "yadav@2183";

const fetchuser = (req, res, next) => {
    //this function is to get user from authtoken and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "invalid token - accesss denied" })
    }
    try {
        const data = jwt.verify(token, JWTS);
        req.user = data.user;
        next();
    }
    catch (error) {
        res.status(401).send({ error: "invalid token - accesss denied" });
    }
};


module.exports = fetchuser;