import { server } from "../ServerAPI";

class AssetData {

    constructor(manuBarcode, name, location = null, customInfo = null) {

    }

}

class Asset {

    constructor(identifier, assetData) {
                
    }

}

const GenerateAssetTags = async (accessToken, projectID, quantity = 1) => {

    const assetTags = await server.post(`/projects/generate-asset-tags`, {
        projectID: projectID,
        quantity: quantity
    }, {
        headers: { authorization: accessToken }
    }).then(res => {
        console.log(res);
    });

}

export { Asset, GenerateAssetTags };