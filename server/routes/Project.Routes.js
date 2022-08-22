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
        let allowedProjects = [];

        const allProjects = await Project.find();

        allProjects.forEach((project) => {
            if(project.allowedUsers?.includes(user._id)) {
                allowedProjects.push(project);
            }
        });

        res.send(allowedProjects);

    }
});

router.route('/get/:id').get(authorize(AuthLevel.Basic), async(req, res) => {

    const user = req.user;
    const { id } = req.params;

    const project = await Project.findById(id);

    if(user.userType === "Admin" || project.allowedUsers?.includes(user._id))
        return res.send(project);

    return res.sendStatus(403); // Forbidden
});

router.route('/update-item').post(authorize(AuthLevel.Basic), async(req, res) => {

    const user = req.user;
    const { projectID, itemBarcode, itemData } = req.body;

    if(!projectID || !itemBarcode || !itemData)
        return res.sendStatus(400); // Client Error

    let project = await Project.findById(projectID);

    if(user.userType !== AuthLevel.Admin && !project.allowedUsers?.includes(user._id))
        return res.sendStatus(403);

    if(itemBarcode.trim().length === 0) {
        return res.sendStatus(400);
    }    

    project.inventoryItems.set(itemBarcode, itemData);

    project.markModified('inventoryItems');
    project.save();

    return res.send({project: project});

});

router.route('/delete-item/:projectID/:barcode').delete(authorize(AuthLevel.Basic), async(req, res) => {
    const user = req.user;
    const { projectID, barcode } = req.params;

    if(!barcode || !projectID)
        return res.sendStatus(400); // Client Error

    let project = await Project.findById(projectID);

    if(user.userType !== AuthLevel.Admin && !project.allowedUsers?.includes(user._id))
        return res.sendStatus(403);

    project.inventoryItems.delete(barcode);

    project.markModified('inventoryItems');
    project.save();

    return res.send({project: project});

});

/*
 * Client Error Codes
 *
 * N/A -> Invalid Body Req
 * 1 -> Item doesn't exist
 * 2 -> Attempting to remove an item from an already zero quantity
 */
router.route('/modify-item-quantity').post(authorize(AuthLevel.Basic), async(req, res) => {

    const user = req.user;
    const { projectID, itemBarcode, value } = req.body;

    if(!projectID || !itemBarcode || !value)
        return res.sendStatus(400); // Client Error

    let project = await Project.findById(projectID);

    // Validate
    if(user.userType !== AuthLevel.Admin && !project.allowedUsers?.includes(user._id))
        return res.sendStatus(403);

    if(!project.inventoryItems.has(itemBarcode)) {
        return res.status(400).send({clientErrorCode: 1}); // Client Error
    }

    let data = project.inventoryItems.get(itemBarcode);
    data.quantity = Number.parseInt(data.quantity) + value;

    if(data.quantity < 0) {
        return res.status(400).send({clientErrorCode: 2}); // Client Error
    }

    project.inventoryItems.set(itemBarcode, data);

    project.markModified('inventoryItems');
    project.save();

    return res.send({project: project});

});

router.route('/add-user-to-project').put(authorize(AuthLevel.Admin), async (req, res) => {
    const { projectID, targetUserID } = req.body;

    if(!projectID || !targetUserID)
        return res.sendStatus(400); // Bad Request

    let targetProject = await Project.findById(projectID);

    if(!targetProject)
        return res.sendStatus(400); // Bad Request

    // TODO: verify the user id is valid

    targetProject.allowedUsers.push(targetUserID);
    targetProject.markModified("allowedUsers");
    targetProject.save();

    return res.send(targetProject); // OK
});

router.route('/remove-user-from-project').post(authorize(AuthLevel.Admin), async (req, res) => {
    const { projectID, targetUserID } = req.body;

    if(!projectID || !targetUserID)
        return res.sendStatus(400); // Bad Request

    let targetProject = await Project.findById(projectID);

    if(!targetProject)
        return res.sendStatus(400); // Bad Request

    // TODO: verify the user id is valid

    let index = targetProject.allowedUsers.indexOf(targetUserID);

    if(index === -1)
        return res.send(400); // Bad Request

    targetProject.allowedUsers.splice(index, 1);
    targetProject.markModified("allowedUsers");
    targetProject.save();

    return res.send(targetProject); // OK
});

router.route('/generate-asset-tags').post(authorize(AuthLevel.Basic), async (req, res) => {
    
    const { projectID, assetData, quantity } = req.body;

    if(!projectID || !assetData || !quantity)
        return res.sendStatus(400); // Bad Req

    let targetProject = await Project.findById(projectID);

    if(!targetProject)
        return res.sendStatus(400); // Bad Req

    const currentIndex = targetProject.assets.__index__;

    const start = currentIndex + 1;
    const end = start + quantity;

    const generatedAssetTagKeys = [...Array(end - start).keys()].map(x => x + start);

    res.send(generatedAssetTagKeys);
});

router.route('/create-asset-definition').post(authorize(AuthLevel.Basic), async (req, res) => {

    const user = req.user;
    const { projectID, manuBarcode, assetDefinition } = req.body;

    if(!projectID || !manuBarcode || !assetDefinition) {
        return res.sendStatus(400);
    }

    let project = await Project.findById(projectID);

    if(!project)
        return res.sendStatus(400);

    // Validate
    if(user.userType !== AuthLevel.Admin && !project.allowedUsers?.includes(user._id))
        return res.sendStatus(403);

    project.assetDefinitions[manuBarcode] = assetDefinition;
    project.markModified("assetDefinitions");
    await project.save();
 
    return res.send(project);
})

module.exports = router;