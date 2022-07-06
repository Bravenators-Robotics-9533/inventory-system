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

        // Verify Token
        User.findOne({
            "userID": authToken
        }).exec((err, user) => {
            if(err) {
                return res.status(400).json({ error: "Something went wrong with login..."});
            }
            if(!user) {
                return res.status(401).json({
                    error: "User does not exist"
                });
            }

            if(!permissionLevel.includes(user.userType)) {
                return res.sendStatus(403); // Forbidden
            }

            req.user = user;
            next();
        });
    }
}

module.exports = { AuthLevel, authorize };