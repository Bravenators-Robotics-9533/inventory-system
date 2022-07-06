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

module.exports = router;