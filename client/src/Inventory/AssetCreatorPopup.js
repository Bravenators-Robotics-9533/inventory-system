import { forwardRef, useState, useImperativeHandle, useRef, useCallback } from 'react';

import Popup from '../Popup/Popup';
import PopupInputField from '../Popup/PopupInputField';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'

import { server } from "../ServerAPI";

import "./AssetCreatorPopup.css"

const AssetCreatorPopup = forwardRef(({ projectID, accessToken, setProject }, ref) => {

    const [isVisible, setIsVisible] = useState(false);

    const [imageURL, setImageURL] = useState(null);

    const productSKURef = useRef();
    const manuBarcodeRef = useRef();
    const productNameRef = useRef();

    const onSubmit = useCallback(() => {

        const name = productNameRef.current?.value;
        const manuBarcode = manuBarcodeRef.current?.value;
        const sku = productSKURef.current?.value;
        
        const assetDefinition = { name: name, sku: sku, imageURL: imageURL };

        // console.log(assetDefinition);
        server.post('projects/create-asset-definition', {
            projectID: projectID,
            manuBarcode: manuBarcode,
            assetDefinition: assetDefinition
        }, {
            headers: { authorization: accessToken }
        }).then(res => {
            if(res?.data)
                setProject(res.data)
        })

    }, [productSKURef, manuBarcodeRef, imageURL, projectID, accessToken, setProject]);

    useImperativeHandle(ref, () => ({
        show() {
            setIsVisible(true);
        }
    }));

    return (
        <Popup id="asset-creator-popup" isActive={isVisible} popupName="Create New Asset Type" submitButtonName="Generate" onSubmit={onSubmit} onClose={() => 
            {
                setIsVisible(false);
                setImageURL(null);
            }}>
            <></>
            <div className="split">
                <div style={{width: "45%"}}>
                    <PopupInputField key="Manufacturer's Barcode" ref={manuBarcodeRef} name="Manufacturer's Barcode" oneline />
                    <PopupInputField key="Product SKU" ref={productSKURef} name="Product SKU" oneline />
                    <PopupInputField kye="Product Name" ref={productNameRef} name="Product Name" oneline/>
                </div>
                <div className="right">
                    
                    <div className="img" key="img">
                        {
                            imageURL && 
                            <img src={imageURL} alt="" />
                        }
                        <div className="img-controls" key='img-controls'>
                            <FontAwesomeIcon className="fa-icon" icon={faPencil} onClick={() => {
                                const value = window.prompt("Enter URL");
                                setImageURL(value);
                            }} />
                            {
                                imageURL &&
                                <FontAwesomeIcon className="fa-icon" icon={faTrash} onClick={() => {
                                    const result = window.confirm("Are you sure you want to remove this image?");

                                    if(!result)
                                        return;

                                    setImageURL(null);
                                }} />
                            }
                        </div>
                    </div>

                </div>
            </div>
        </Popup>
    )

});

export default AssetCreatorPopup;