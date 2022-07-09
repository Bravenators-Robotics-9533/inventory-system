const router = require('express').Router();
const Project = require('../models/Project.Model');

const { AuthLevel, authorize } = require('../middleware/AuthenticationMiddleware');

router.route('/create-new').post(authorize(AuthLevel.Admin), async(req, res) => {
    
    const { projectName } = req.body;

    const project = new Project({
        projectName: projectName
    });

    project.save();

    res.status(200).send(project); // OK
});

router.route('/get-all').get(authorize(AuthLevel.Admin), async(req, res) => {
    const allProjects = await Project.find();
    res.send(allProjects);
});

router.route('/get/:id').get(authorize(AuthLevel.Basic), async(req, res) => {

    const user = req.user;
    const { id } = req.params;

    if(user.userType === "Admin") { // Admin

        const project = await Project.findById(id);
        return res.send(project);

    } else {
        res.sendStatus(403); // Forbidden
    }

})

module.exports = router;