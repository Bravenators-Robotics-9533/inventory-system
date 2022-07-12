const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    projectName: {
        type: String,
        required: true,
        unique: true
    },
    allowedUsers: {
        type: [Schema.Types.ObjectId]
    },
    moderators: {
        type: [Schema.Types.ObjectId]
    },
    inventoryItems: {
        type: Map,
        of: Object,
        default: {}
    }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;