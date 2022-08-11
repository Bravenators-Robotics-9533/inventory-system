import { server } from "../ServerAPI";

class AssetData {
    constructor(manuBarcode, name, location = null, customInfo = null) {
        this.manuBarcode = manuBarcode;
        this.name = name;
        this.location = location;
        this.customInfo = customInfo;
    }
}

class Asset {
    constructor(identifier, assetData) {
        this.identifier = identifier;
        this.assetData = assetData;
    }
}

const GenerateAssetTags = async (accessToken, projectID, assetData, quantity = 1) => {

    const assetTags = await server.post(`/projects/generate-asset-tags`, {
        projectID: projectID,
        assetData: assetData,
        quantity: quantity
    }, {
        headers: { authorization: accessToken }
    }).then(res => {
        console.log(res);
    });

}

export { Asset, AssetData, GenerateAssetTags };