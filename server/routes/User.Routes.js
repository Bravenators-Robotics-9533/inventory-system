const router = require('express').Router();

const { authorize, AuthLevel } = require('../middleware/AuthenticationMiddleware');
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