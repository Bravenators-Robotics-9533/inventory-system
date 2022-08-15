import { forwardRef, useState, useImperativeHandle, useRef } from 'react';

import Popup from '../Popup/Popup';
import PopupInputField from '../Popup/PopupInputField';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'

import "./AssetCreatorPopup.css"

const AssetCreatorPopup = forwardRef((props, ref) => {

    const [isVisible, setIsVisible] = useState(true);

    const productSKURef = useRef();
    const manuBarcodeRef = useRef();
    const quantityRef = useRef();

    useImperativeHandle(ref, () => ({
        show() {
            setIsVisible(true);
        }
    }));

    return (
        <Popup id="asset-creator-popup" isActive={isVisible} popupName="Generate Assets" submitButtonName="Generate" onSubmit={undefined} onClose={() => setIsVisible(false) }>
            <></>
            <div className="split">
                <div style={{width: "45%"}}>
                    <PopupInputField key="Manufacturer's Barcode" ref={manuBarcodeRef} name="Manufacturer's Barcode" oneline />
                    <PopupInputField key="Product SKU" ref={productSKURef} name="Product SKU" oneline />
                    <PopupInputField key="Quantity" name="Quantity" ref={quantityRef} startingValue={1} style={{width: "4em", textAlign: "center"}} oneline 
                    type="number" customValidationCallback={() => {
                        const value = quantityRef.current.value;
                        return Number.isInteger(Number.parseInt(value)) && Number.parseInt(value) > 0
                    }}/>
                </div>
                <div className="right">
                    <div className="img">
                        <FontAwesomeIcon className="fa-icon" icon={faImage} />
                    </div>
                    <div className="controls">
                        <FontAwesomeIcon className="fa-icon" icon={faPencil} />
                        <div className="bar"></div>
                        <FontAwesomeIcon className="fa-icon" icon={faTrash} />
                    </div>
                </div>
            </div>
        </Popup>
    )

});

export default AssetCreatorPopup;