const router = require('express').Router();

router.route('/login').post((req, res) => {

    res.send("Hello World");

});

module.exports = router;