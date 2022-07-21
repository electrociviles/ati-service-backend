
var express = require('express')
const jwt = require("jsonwebtoken");

const authMiddleware = express.Router();
authMiddleware.use((req, res, next) => {

    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ status: 'err', message: 'jwt expired', err });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.status(403).send({
            authHeader,
            status: 'error',
            message: 'No token provided.'
        });
    }
});
module.exports = authMiddleware