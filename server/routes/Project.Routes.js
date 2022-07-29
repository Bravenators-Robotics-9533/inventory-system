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

router.route('/get-all').get(authorize(AuthLevel.Basic), async(req, res) => {

    const user = req.user;

    if(user.userType === "Admin") {
        const allProjects = await Project.find();
        res.send(allProjects);
    } else {
        res.send([]);
    }
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

});

router.route('/update-item').post(authorize(AuthLevel.Basic), async(req, res) => {

    const user = req.user;
    const { projectID, itemBarcode, itemData } = req.body;

    if(!projectID || !itemBarcode || !itemData)
        return res.sendStatus(400); // Client Error

    if(user.userType === "Admin") { // Admin

        let project = await Project.findById(projectID);

        project.inventoryItems.set(itemBarcode, itemData);

        project.markModified('inventoryItems');
        project.save();

        return res.send({project: project});
    } else { // TODO: Check to see if their on the allowed projects list
        res.sendStatus(403); // Forbidden
    }

});

router.route('/modify-item-quantity').post(authorize(AuthLevel.Basic), async(req, res) => {

    const user = req.user;
    const { projectID, itemBarcode, value } = req.body;

    if(!projectID || !itemBarcode || !value)
        return res.sendStatus(400); // Client Error

    if(user.userType === "Admin") { // Admin
        let project = await Project.findById(projectID);

        if(!project.inventoryItems.has(itemBarcode)) {
            return res.sendStatus(400); // Client Error
        }

        let data = project.inventoryItems.get(itemBarcode);
        data.quantity = Number.parseInt(data.quantity) + value;

        if(data.quantity < 0) {
            return res.status(400).send({error: "Can not have a value less than 0"});
        }

        project.inventoryItems.set(itemBarcode, data);

        project.markModified('inventoryItems');
        project.save();

        return res.send({project: project});
    } else { // TODO: FIx
        
    }

})

module.exports = router;