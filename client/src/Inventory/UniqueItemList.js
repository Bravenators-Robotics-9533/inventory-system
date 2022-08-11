import { forwardRef, useImperativeHandle, useRef } from "react";
import { GenerateAssetTags } from "./Asset";

import AssetCreatorPopup from "./AssetCreatorPopup";

const UniqueItemList = forwardRef(({ applicationState, project }, ref) => {

    const assetCreatorPopupRef = useRef();

    useImperativeHandle(ref, () => ({
        createNewAsset() {
            assetCreatorPopupRef.current?.show();
        }
    }));

    return (
        <>
        
        <AssetCreatorPopup ref={assetCreatorPopupRef} />

        <div className="table-wrapper" id="unique-item-list">

            <button onClick={() => GenerateAssetTags(applicationState.accessToken, project._id, 10) }>Generate Asset Tags</button>

        </div>

        </>
    );

});

export default UniqueItemList;