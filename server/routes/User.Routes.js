const router = require('express').Router();

const User = require('../models/User.Model');

router.route('/login').post((req, res) => {

    const { userID } = req.body;

    User.findOne({
        "userID": userID
    }).exec((err, user) => {
        if(err) {
            return res.status(400).json({ error: "Something went wrong with login..."});
        } else {
            if(user) {
                res.json({user: user})
            } else {
                return res.status(401).json({
                    error: "User does not exist"
                });
            }
        }
    });

});

router.route('/validate-token').get((req, res) => {
    res.send(true);
});

router.route('/get/:userID').get((req, res) => {

    const { userID } = req.params;

    User.findOne({
        "userID": userID
    }).exec((err, user) => {
        if(err) {
            return res.status(400).json({ error: "Something went wrong server wise..." });
        } else {
            if(user) {
                res.json({user: user});
            } else {
                return res.status(401).json({
                    error: "User does not exist!"
                });
            }
        }
    });
})

module.exports = router;