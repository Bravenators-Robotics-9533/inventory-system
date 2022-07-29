const { OAuth2Client } = require("google-auth-library");
const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const jwt = require('jsonwebtoken');

const User = require('../models/User.Model');

const AuthLevel = {
    Basic: [ "Admin", "Basic" ],
    Admin: [ "Admin" ]
};

const authorize = (permissionLevel) => {
    return (req, res, next) => {

        const authToken = req.headers['authorization'];

        if(authToken == null)
            return res.sendStatus(401); // Unauthorized

        jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(401).send(err); // Unauthorized

            User.findById(user._id).then((result) => {
                if(!permissionLevel.includes(result.userType)) {
                    return res.sendStatus(403); // Forbidden
                }

                req.user = result;
                next();

            });
        });
    }
}

module.exports = { AuthLevel, authorize, googleAuthClient };