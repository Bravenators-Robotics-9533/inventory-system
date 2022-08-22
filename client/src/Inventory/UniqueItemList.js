import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import AssetCreatorPopup from "./AssetCreatorPopup";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faAngleDown, faTrash, faInfo, faPlus } from "@fortawesome/free-solid-svg-icons";

import './UniqueItemList.css'

const AssetElement = ({ barcode, data }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="asset-definition">
            <div className="inline" onClick={() => setIsCollapsed(curr => !curr)}>
                <FontAwesomeIcon icon={isCollapsed ? faAngleRight : faAngleDown} className="fa-icon"/>
                <h1>{data.name}</h1>
                <div className="quantity">
                    <p>0</p>
                </div>
            </div>
            <div className={`content ${isCollapsed ? "collapsed" : undefined}`}>
                <div>   
                    <h3>{data.sku}</h3>
                    <h3>{barcode}</h3>
                </div>
                {
                    data.imageURL &&
                    <img src={data.imageURL} alt="" />
                }
                <div>
                    <h1 style={{marginBottom: "0.25em"}}>Active Assets</h1>
                    <button style={{backgroundColor: "var(--bg-color)"}}>Generate Asset Tags</button>
                    <ul>
                        <li>
                            <div className="first-line">
                                <p>Something 1</p>
                                <div className="controls">
                                    <FontAwesomeIcon className="fa-icon" icon={faInfo} />
                                    <FontAwesomeIcon className="fa-icon" icon={faTrash} />
                                </div>
                            </div>
                            <p className="desc">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nam expedita quos consequatur rem officiis aliquid?</p>
                        </li>
                    </ul>
                    <button className="delete-btn" onClick={() => {
                        const confirmation = window.confirm("Are you sure you want to delete this asset type!? You will loose all the asset tags associated with it forever!!!");

                        if(!confirmation)
                            return;

                        

                    }}>Delete Entire Asset Type</button>
                </div>
            </div>
        </div>
    )
}

const AssetList = ({ data }) => {

    const [elements, setElements] = useState(null);

    useEffect(() => {

        let left = [];
        let center = [];
        let right = [];

        let count = 0;

        for(let i in data) {

            let elm = <AssetElement key={i} barcode={i} data={data[i]} />
            
            if(count % 3 === 0) {
                left.push(elm);
            } else if(count % 3 === 1) {
                center.push(elm);
            } else {
                right.push(elm);
            }

            count++;
        }

        setElements(
            <div id="asset-list">
                <div className="col">{left}</div>
                <div className="col">{center}</div>
                <div className="col">{right}</div>
            </div>
        );

    }, [data]);

    return elements && elements;
}

const UniqueItemList = forwardRef(({ applicationState, project, setProject }, ref) => {

    const assetCreatorPopupRef = useRef();

    useImperativeHandle(ref, () => ({
        createNewAsset() {
            assetCreatorPopupRef.current?.show();
        }
    }));

    return (
        <>
        
        <AssetCreatorPopup ref={assetCreatorPopupRef} projectID={project._id} accessToken={applicationState.accessToken} setProject={setProject} />
   
        <div id="unique-item-list">
            <h1>Scan Asset Tag to Locate</h1>
            <AssetList data={project.assetDefinitions} />
        </div>

        </>
    );

});

export default UniqueItemList;