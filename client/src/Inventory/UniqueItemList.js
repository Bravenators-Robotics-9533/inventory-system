import { forwardRef } from "react";
import { GenerateAssetTags } from "./Asset";

const UniqueItemList = forwardRef(({ applicationState, project }, ref) => {

    return (
        <>
        
        <div className="table-wrapper" id="unique-item-list">

            <button onClick={() => GenerateAssetTags(applicationState.accessToken, project._id, 10) }>Generate Asset Tags</button>

        </div>

        </>
    );

});

export default UniqueItemList;