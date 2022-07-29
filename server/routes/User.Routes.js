const router = require('express').Router();

const { authorize, AuthLevel, googleAuthClient } = require('../middleware/AuthenticationMiddleware');
const User = require('../models/User.Model');

const jwt = require('jsonwebtoken');

router.route('/login').post((req, res) => {

    const { tokenID } = req.body;

    if(!tokenID)
        return res.sendStatus(400); // Bad Client Error

    googleAuthClient.verifyIdToken({ idToken: tokenID, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
        const { email_verified, email } = response.payload;

        const workspaceUserID = email.split("@")[0];

        if(email_verified) {
            User.findOne({
                "userID": workspaceUserID
            }).exec((err, user) => {
                if(err) {
                    return res.status(400).json({
                        error: "Something went wrong with google login..."
                    });
                } else {
                    if(user) {
                        const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8hr' });
                        res.json({accessToken: accessToken, user: user});
                    } else {
                        return res.status(401).json({
                            error: "Your account doesn't exist!"
                        });
                    }
                }
            })
        }
    });

});

router.route('/verify-token').post((req, res) => {

    const { tokenID } = req.body;

    if(!tokenID)
        return res.sendStatus(400); // Bad Client Error

    jwt.verify(tokenID, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(401).send(err); // Unauthorized

        User.findById(user._id).then((result) => {
            return res.send(result);
        });
    });

});

router.route('/get/:userID').get(authorize(AuthLevel.Basic), async (req, res) => {

    const user = req.user;

    const { userID } = req.params;

    if(!userID)
        return res.sendStatus(400); // Bad Client Request

    if(user.userType === AuthLevel.Basic) { // Ensure getting self...
        if(userID !== user._id)
            return res.send(403); // Forbidden
    }

    const queriedUser = await User.findById(userID);
    res.send({user: queriedUser});
});

router.route('/get-all').get(authorize(AuthLevel.Admin), async(req, res) => {
    const users = await User.find();
    res.send(users);
});

router.route('/:id').delete(authorize(AuthLevel.Admin), async(req, res) => {

    const { id } = req.params;

    if(!id)
        return res.sendStatus(400); // Client Error

    await User.findByIdAndDelete(id);

    res.sendStatus(200); // OK
});

router.route('/').put(authorize(AuthLevel.Admin), async(req, res) => {

    const { userName, userType, userID } = req.body;

    if(!userName || !userType || !userID)
        return res.sendStatus(400); // Client Error

    // TODO: Verify Admin/Basic, naming collision and or userID collision

    let user = new User({ userID, userType, userName });

    user.save();

    return res.send(user);
});

router.route('/set-type/:id').post(authorize(AuthLevel.Admin), async(req, res) => {

    const { id } = req.params;
    const { type } = req.body;

    if(!id || !type)
        return res.sendStatus(400); // Client Error

    if(type !== "Admin" && type !== "Basic")
        return res.sendStatus(400); // Client Error

    let user = await User.findById(id);

    if(!user)
        return res.sendStatus(500); // Internal Server Error

    user.userType = type;
    user.save();

    res.send(user);
})

module.exports = router;